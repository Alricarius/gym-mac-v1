import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards,
} from '@nestjs/common';
import { PlansService } from '../../application/services/plans.service';
import { CreatePlanDto } from '../../application/dtos/create-plan.dto';
import { UpdatePlanDto } from '../../application/dtos/update-plan.dto';
import { QueryPlanDto } from '../../application/dtos/query-plan.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@Body() dto: CreatePlanDto) {
    return this.plansService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryPlanDto) {
    return this.plansService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.plansService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}
