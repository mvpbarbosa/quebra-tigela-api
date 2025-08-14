import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ArtistsService } from './artists.service';

@Controller('artists')
export class ArtistsController {
  constructor(private readonly service: ArtistsService) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get('search')
  search(
    @Query('city') city?: string,
    @Query('artType') artType?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.search({ city, artType, page: +page, limit: +limit });
  }

  @Get(':id/profile')
  profile(@Param('id') id: string): Promise<any> {
    return this.service.profile(id);
  }
}
