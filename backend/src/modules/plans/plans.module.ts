import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './domain/entities/plan.entity';
import { PlansService } from './application/services/plans.service';
import { PlansController } from './interfaces/controllers/plans.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlansController],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
