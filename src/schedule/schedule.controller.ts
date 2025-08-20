import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post()
  set(@Body() dto: CreateScheduleDto) {
    return this.service.set(dto);
  }

  @Get('artist/:artistId/future')
  listFuture(@Param('artistId') id: string) {
    return this.service.listFuture(id);
  }
}
