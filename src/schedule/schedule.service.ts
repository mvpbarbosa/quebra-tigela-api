import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { ScheduleEntry, ScheduleDocument } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import type { ScheduleStatus } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

interface ArtistScheduleFilter {
  artistId: string;
  from?: string;
  to?: string;
  status?: ScheduleStatus;
  limit?: number;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleEntry.name) private model: Model<ScheduleDocument>,
  ) {}

  async create(dto: CreateScheduleDto) {
    const artistId = this.ensureObjectId(dto.artistId, 'artistId');
    const date = this.ensureDate(dto.date, 'date');

    await this.ensureUnique(artistId, date);

    const created = await this.model.create({
      artistId,
      date,
      status: dto.status,
    });

    return created.toObject();
  }

  async findById(id: string) {
    const objectId = this.ensureObjectId(id, 'id');
    const entry = await this.model.findById(objectId).lean();
    if (!entry) {
      throw new NotFoundException('Agenda não encontrada');
    }
    return entry;
  }

  async listByArtist(filter: ArtistScheduleFilter) {
    const artistId = this.ensureObjectId(filter.artistId, 'artistId');
    const query: FilterQuery<ScheduleDocument> = { artistId };

    if (filter.from || filter.to) {
      query.date = {} as FilterQuery<ScheduleDocument>['date'];
      if (filter.from) {
        (query.date as any).$gte = this.ensureDate(filter.from, 'from');
      }
      if (filter.to) {
        (query.date as any).$lte = this.ensureDate(filter.to, 'to');
      }
    }

    if (filter.status) {
      query.status = filter.status;
    }

    const limit = Math.max(1, Math.min(filter.limit ?? 200, 500));

    return this.model.find(query).sort({ date: 1 }).limit(limit).lean();
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const objectId = this.ensureObjectId(id, 'id');
    const entry = await this.model.findById(objectId);
    if (!entry) {
      throw new NotFoundException('Agenda não encontrada');
    }

    const nextArtistId = dto.artistId
      ? this.ensureObjectId(dto.artistId, 'artistId')
      : entry.artistId;
    const nextDate = dto.date ? this.ensureDate(dto.date, 'date') : entry.date;
    const nextStatus = dto.status ?? entry.status;

    if (entry.status === 'booked' && nextStatus === 'available') {
      throw new BadRequestException(
        'Não é possível reabrir uma data já reservada',
      );
    }

    if (
      (dto.artistId || dto.date) &&
      !(
        entry.artistId.equals(nextArtistId) &&
        entry.date.getTime() === nextDate.getTime()
      )
    ) {
      await this.ensureUnique(nextArtistId, nextDate, objectId);
    }

    entry.artistId = nextArtistId;
    entry.date = nextDate;
    entry.status = nextStatus;

    await entry.save();
    return entry.toObject();
  }

  async remove(id: string) {
    const objectId = this.ensureObjectId(id, 'id');
    const result = await this.model.findByIdAndDelete(objectId);
    if (!result) {
      throw new NotFoundException('Agenda não encontrada');
    }
    return { deleted: true } as const;
  }

  async listFuture(artistId: string) {
    return this.listByArtist({
      artistId,
      from: new Date().toISOString(),
    });
  }

  private ensureObjectId(value: string, field: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Campo ${field} inválido`);
    }
    return new Types.ObjectId(value);
  }

  private ensureDate(value: string | Date, field: string): Date {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Campo ${field} deve ser uma data válida`);
    }
    return date;
  }

  private async ensureUnique(
    artistId: Types.ObjectId,
    date: Date,
    ignoreId?: Types.ObjectId,
  ) {
    const query: FilterQuery<ScheduleDocument> = {
      artistId,
      date,
    };

    if (ignoreId) {
      query._id = { $ne: ignoreId } as any;
    }

    const existing = await this.model.findOne(query).lean();
    if (existing) {
      throw new ConflictException(
        'Já existe uma agenda cadastrada para este artista nesta data',
      );
    }
  }
}
