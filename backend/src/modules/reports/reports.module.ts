import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from '../payments/domain/entities/payment.entity';
import { Member } from '../members/domain/entities/member.entity';
import { Subscription } from '../subscriptions/domain/entities/subscription.entity';
import { CheckIn } from '../check-in/domain/entities/check-in.entity';
import { ReportsService } from './application/services/reports.service';
import { ReportsController } from './interfaces/controllers/reports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Member, Subscription, CheckIn])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
