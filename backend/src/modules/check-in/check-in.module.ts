import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckIn } from './domain/entities/check-in.entity';
import { Member } from '../members/domain/entities/member.entity';
import { Subscription } from '../subscriptions/domain/entities/subscription.entity';
import { CheckInsService } from './application/services/check-ins.service';
import { CheckInsController } from './interfaces/controllers/check-ins.controller';
import { CheckInGateway } from './interfaces/gateways/check-in.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([CheckIn, Member, Subscription])],
  controllers: [CheckInsController],
  providers: [CheckInsService, CheckInGateway],
})
export class CheckInModule {}
