import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './domain/entities/subscription.entity';
import { SubscriptionsService } from './application/services/subscriptions.service';
import { SubscriptionsController } from './interfaces/controllers/subscriptions.controller';
import { PlansModule } from '../plans/plans.module';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription]), PlansModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
