import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Artist, ArtistDocument } from './schemas/artist.schema';
import {
  ServiceOffering,
  ServiceOfferingDocument,
} from '../services/schemas/service.schema';
import {
  ScheduleEntry,
  ScheduleDocument,
} from '../schedule/schemas/schedule.schema';
import { Review, ReviewDocument } from '../reviews/schemas/review.schema';
import { CreateArtistDto } from './dto/create-artist.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ArtistsService {
  constructor(
    @InjectModel(Artist.name) private artistModel: Model<ArtistDocument>,
    @InjectModel(ServiceOffering.name)
    private serviceModel: Model<ServiceOfferingDocument>,
    @InjectModel(ScheduleEntry.name)
    private scheduleModel: Model<ScheduleDocument>,
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(payload: CreateArtistDto): Promise<Artist> {
    try {
      const { password, ...rest } = payload;
      const passwordHash = await bcrypt.hash(password, 10);
      const artist = new this.artistModel({ ...rest, passwordHash });
      await artist.save();

      const obj = artist.toObject();
      delete (obj as { passwordHash?: string }).passwordHash;
      return obj as Artist;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          `O campo '${Object.keys(error.keyPattern)[0]}' com valor '${Object.values(error.keyValue)[0]}' já está em uso.`,
        );
      }
      if (error.name === 'ValidationError') {
        throw new BadRequestException('Erro de validação: ' + error.message);
      }
      throw new InternalServerErrorException(
        'Erro ao criar artista: ' + error.message,
      );
    }
  }

  async search({
    city,
    artType,
    limit = 20,
    page = 1,
  }: {
    city?: string;
    artType?: string;
    limit?: number;
    page?: number;
  }): Promise<Artist[]> {
    const match: { verified: boolean; city?: string; artTypes?: string } = {
      verified: true,
    };
    if (city) match.city = city;
    if (artType) match.artTypes = artType;

    const artists = await this.artistModel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: 'services',
          localField: '_id',
          foreignField: 'artistId',
          as: 'services',
          pipeline: [{ $match: { active: true } }],
        },
      },
      { $addFields: { activeServicesCount: { $size: '$services' } } },
      { $match: { activeServicesCount: { $gt: 0 } } },
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'artistId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          ratingAvg: {
            $cond: [
              { $gt: [{ $size: '$reviews' }, 0] },
              { $avg: '$reviews.rating' },
              null,
            ],
          },
          ratingCount: { $size: '$reviews' },
        },
      },
      { $project: { passwordHash: 0 } },
      { $sort: { ratingAvg: -1, activeServicesCount: -1, name: 1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);
    return artists as Artist[];
  }
  async profile(artistId: string): Promise<{
    artist: Omit<Artist, 'passwordHash'>;
    services: ServiceOffering[];
    schedule: ScheduleEntry[];
    rating: { avg: number | null; count: number };
  }> {
    const _id = new Types.ObjectId(artistId);
    const artistDoc = await this.artistModel.findById(_id).lean();
    if (!artistDoc || !artistDoc.verified)
      throw new NotFoundException('Artist not found/verified');

    const [services, schedule, ratingAgg] = await Promise.all([
      this.serviceModel.find({ artistId: _id, active: true }).lean(),
      this.scheduleModel
        .find({
          artistId: _id,
          date: { $gte: new Date() },
          status: { $in: ['available', 'booked'] },
        })
        .sort({ date: 1 })
        .limit(100)
        .lean(),
      this.reviewModel.aggregate([
        { $match: { artistId: _id } },
        {
          $group: {
            _id: '$artistId',
            avg: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const agg = ratingAgg[0] ?? { avg: null, count: 0 };
    const rating = {
      avg: agg.avg != null ? Number(agg.avg) : null,
      count: typeof agg.count === 'number' ? agg.count : Number(agg.count || 0),
    };

    const { passwordHash, ...safeArtist } = artistDoc;
    return {
      artist: safeArtist as Omit<Artist, 'passwordHash'>,
      services,
      schedule,
      rating,
    };
  }

  async findAll(): Promise<Artist[]> {
    return this.artistModel.find().select('-passwordHash').lean();
  }

  async findById(id: string): Promise<Artist | null> {
    const artist = await this.artistModel
      .findById(id)
      .select('-passwordHash')
      .lean();
    if (!artist) throw new NotFoundException('Artista não encontrado');
    return artist;
  }

  async update(id: string, payload: Partial<CreateArtistDto>): Promise<Artist> {
    if (payload.password) {
      const passwordHash = await bcrypt.hash(payload.password, 10);
      const { password, ...rest } = payload;
      Object.assign(rest, { passwordHash });
      payload = rest;
    }
    const updated = await this.artistModel
      .findByIdAndUpdate(id, payload, { new: true })
      .select('-passwordHash')
      .lean();
    if (!updated) throw new NotFoundException('Artista não encontrado');
    return updated as Artist;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.artistModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException('Artista não encontrado');
    return { deleted: true };
  }

  async verifyArtistIdentity(
    artistId: string,
    currentPhotoBuffer: Buffer,
    documentPhotoBuffer: Buffer,
  ): Promise<{
    verified: boolean;
    similarity: number;
    artistUpdated: boolean;
    verificationDetails: any;
  }> {
    // Simulação para desenvolvimento
    const verified = Math.random() > 0.5; // 50% chance

    if (verified) {
      await this.artistModel.findByIdAndUpdate(artistId, {
        verified: true,
        verifiedAt: new Date(),
      });
    }

    return {
      verified,
      similarity: verified ? 0.85 : 0.45,
      artistUpdated: verified,
      verificationDetails: {
        detectionMethod: 'Mock verification (development mode)',
        threshold: 0.6,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
