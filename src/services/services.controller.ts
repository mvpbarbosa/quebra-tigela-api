import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceOfferingDto } from './dto/create-service.dto';

@Controller('service-offerings')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceOfferingDto) {
    return this.service.create(dto);
  }

  @Get('artist/:artistId')
  byArtist(@Param('artistId') id: string) {
    return this.service.byArtist(id);
  }
}
