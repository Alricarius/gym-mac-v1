import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from '../../application/services/subscriptions.service';
import { CreateSubscriptionDto } from '../../application/dtos/create-subscription.dto';
import { QuerySubscriptionDto } from '../../application/dtos/query-subscription.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Body() dto: CreateSubscriptionDto, @CurrentUser('id') userId: string) {
    return this.subscriptionsService.create(dto, userId);
  }

  @Get()
  findAll(@Query() query: QuerySubscriptionDto) {
    return this.subscriptionsService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.subscriptionsService.findById(id);
  }

  @Post(':id/pause')
  pause(@Param('id') id: string) {
    return this.subscriptionsService.pause(id);
  }

  @Post(':id/resume')
  resume(@Param('id') id: string) {
    return this.subscriptionsService.resume(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.subscriptionsService.cancel(id);
  }
}
