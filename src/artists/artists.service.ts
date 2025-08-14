import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(payload: any) {
    return this.artistModel.create(payload);
  }

  // RF03: filtro por cidade; RF04: filtro por tipo; apenas verificados e com ao menos 1 serviço ativo
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

    // filtrar com pelo menos 1 serviço ativo
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
      // média de rating
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
  async profile(artistId: string): Promise<any> {
    const _id = new Types.ObjectId(artistId);
    const artist = await this.artistModel.findById(_id).lean();
    if (!artist || !artist.verified)
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

    const rating = ratingAgg[0] ?? { avg: null, count: 0 };
    return { ...artist, services, schedule, rating };
  }
}
