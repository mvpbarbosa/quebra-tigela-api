import { Module } from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { ArtistsController } from './artists.controller';

@Module({
  providers: [ArtistsService],
  controllers: [ArtistsController]
})
export class ArtistsModule {}
