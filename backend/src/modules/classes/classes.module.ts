import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymClass } from './domain/entities/gym-class.entity';
import { Schedule } from './domain/entities/schedule.entity';
import { ClassesService } from './application/services/classes.service';
import { ClassesController } from './interfaces/controllers/classes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GymClass, Schedule])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [TypeOrmModule, ClassesService],
})
export class ClassesModule {}
