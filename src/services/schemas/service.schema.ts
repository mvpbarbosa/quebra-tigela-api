import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

class Media {
  @Prop({ required: true, enum: ['image', 'video'] }) type: 'image' | 'video';
  @Prop({ required: true }) url: string;
}

@Schema({ collection: 'services' })
export class ServiceOffering {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Artist', required: true, index: true })
  artistId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Media], default: [] })
  media: Media[];

  @Prop({ default: true, index: true })
  active: boolean;
}
export type ServiceOfferingDocument = HydratedDocument<ServiceOffering>;
export const ServiceOfferingSchema =
  SchemaFactory.createForClass(ServiceOffering);
ServiceOfferingSchema.index({ artistId: 1, active: 1 });
