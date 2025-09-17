import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import { ArtistsService } from './artists.service';
import { CreateArtistDto } from './dto/create-artist.dto';
import { Artist } from './schemas/artist.schema';
import { ServiceOffering } from '../services/schemas/service.schema';
import { ScheduleEntry } from '../schedule/schemas/schedule.schema';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly service: ArtistsService) {}

  @Post()
  create(@Body() dto: CreateArtistDto): Promise<Artist> {
    return this.service.create(dto);
  }

  @Get('search')
  search(
    @Query('city') city?: string,
    @Query('artType') artType?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ): Promise<Artist[]> {
    return this.service.search({ city, artType, page: +page, limit: +limit });
  }

  @Get(':id/profile')
  profile(@Param('id') id: string): Promise<{
    artist: Omit<Artist, 'passwordHash'>;
    services: ServiceOffering[];
    schedule: ScheduleEntry[];
    rating: { avg: number | null; count: number };
  }> {
    return this.service.profile(id);
  }

  @Get()
  getAll(): Promise<Artist[]> {
    return this.service.findAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Artist | null> {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateArtistDto>,
  ): Promise<Artist> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.service.remove(id);
  }
}
