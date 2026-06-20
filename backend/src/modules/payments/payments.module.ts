import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './domain/entities/payment.entity';
import { Branch } from '../branches/domain/entities/branch.entity';
import { PaymentsService } from './application/services/payments.service';
import { PaymentsController } from './interfaces/controllers/payments.controller';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Branch]), SubscriptionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
