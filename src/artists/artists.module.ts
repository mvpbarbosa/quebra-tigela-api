import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Artist, ArtistSchema } from './schemas/artist.schema';
import {
  ServiceOffering,
  ServiceOfferingSchema,
} from '../services/schemas/service.schema';
import {
  ScheduleEntry,
  ScheduleSchema,
} from '../schedule/schemas/schedule.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Artist.name, schema: ArtistSchema },
      { name: ServiceOffering.name, schema: ServiceOfferingSchema },
      { name: ScheduleEntry.name, schema: ScheduleSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [ArtistsController],
  providers: [ArtistsService],
  exports: [ArtistsService],
})
export class ArtistsModule {}
