import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ClassesService } from '../../application/services/classes.service';
import { CreateClassDto } from '../../application/dtos/create-class.dto';
import { UpdateClassDto } from '../../application/dtos/update-class.dto';
import { QueryClassDto } from '../../application/dtos/query-class.dto';
import { CreateScheduleDto } from '../../application/dtos/create-schedule.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

@Controller('classes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @Post()
  create(@Body() dto: CreateClassDto) {
    return this.classesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryClassDto) {
    return this.classesService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.classesService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClassDto) {
    return this.classesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classesService.softDelete(id);
  }

  @Post(':id/schedules')
  addSchedule(@Param('id') id: string, @Body() dto: CreateScheduleDto) {
    return this.classesService.addSchedule(id, dto);
  }

  @Delete(':id/schedules/:scheduleId')
  removeSchedule(
    @Param('id') id: string,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.classesService.removeSchedule(id, scheduleId);
  }
}
