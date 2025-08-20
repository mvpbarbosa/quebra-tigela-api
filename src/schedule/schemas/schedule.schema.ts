import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ collection: 'schedule' })
export class ScheduleEntry {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Artist', required: true, index: true })
  artistId: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  date: Date; 

  @Prop({
    required: true,
    enum: ['available', 'unavailable', 'booked'],
    default: 'available',
    index: true,
  })
  status: 'available' | 'unavailable' | 'booked';
}
export type ScheduleDocument = HydratedDocument<ScheduleEntry>;
export const ScheduleSchema = SchemaFactory.createForClass(ScheduleEntry);
ScheduleSchema.index({ artistId: 1, date: 1 }, { unique: true });
