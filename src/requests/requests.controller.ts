import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestStatusDto } from './dto/update-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.service.create(dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: UpdateRequestStatusDto) {
    return this.service.changeStatus(id, dto.status);
  }

  @Get('user/:userId')
  byUser(@Param('userId') userId: string) {
    return this.service.byUser(userId);
  }

  @Get('artist/:artistId')
  byArtist(@Param('artistId') artistId: string) {
    return this.service.byArtist(artistId);
  }
}
