import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import {
  CreateScheduleDto,
  scheduleStatusValues,
} from './dto/create-schedule.dto';
import type { ScheduleStatus } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post()
  create(@Body() dto: CreateScheduleDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get('artist/:artistId')
  listByArtist(
    @Param('artistId') artistId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('status') status?: ScheduleStatus,
    @Query('limit') limit?: string,
  ) {
    if (status && !scheduleStatusValues.includes(status)) {
      throw new BadRequestException('Status de agenda inválido');
    }
    return this.service.listByArtist({
      artistId,
      from,
      to,
      status,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('artist/:artistId/future')
  listFuture(@Param('artistId') id: string) {
    return this.service.listFuture(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Informe pelo menos um campo para atualização da agenda',
      );
    }
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
