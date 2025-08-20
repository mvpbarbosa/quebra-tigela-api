import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  collection: 'requests',
  timestamps: { createdAt: 'requestedAt', updatedAt: 'updatedAt' },
})
export class Request {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Artist', required: true, index: true })
  artistId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ServiceOffering',
    required: true,
    index: true,
  })
  serviceId: Types.ObjectId;

  @Prop({ type: Date, required: true, index: true })
  eventDate: Date;

  @Prop()
  location: string;

  @Prop({
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

  @Prop()
  details?: string;
}
export type RequestDocument = HydratedDocument<Request>;
export const RequestSchema = SchemaFactory.createForClass(Request);
RequestSchema.index(
  { artistId: 1, eventDate: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'accepted', 'completed'] },
    },
  },
);
