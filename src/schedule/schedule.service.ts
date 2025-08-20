import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ScheduleEntry, ScheduleDocument } from './schemas/schedule.schema';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectModel(ScheduleEntry.name) private model: Model<ScheduleDocument>,
  ) {}

  async set(dto: CreateScheduleDto) {
    const artistId = new Types.ObjectId(dto.artistId);
    const date = new Date(dto.date);
    const status = dto.status;
    const existing = await this.model.findOne({ artistId, date });
    if (existing && existing.status === 'booked' && status === 'available') {
      throw new BadRequestException('Date is already booked');
    }
    return this.model.updateOne(
      { artistId, date },
      { $set: { status } },
      { upsert: true },
    );
  }

  listFuture(artistId: string) {
    return this.model
      .find({
        artistId: new Types.ObjectId(artistId),
        date: { $gte: new Date() },
      })
      .sort({ date: 1 })
      .limit(200);
  }
}
