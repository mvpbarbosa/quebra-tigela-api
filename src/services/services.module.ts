import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ServiceOffering,
  ServiceOfferingSchema,
} from './schemas/service.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ServiceOffering.name, schema: ServiceOfferingSchema },
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
