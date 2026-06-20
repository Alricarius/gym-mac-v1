import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './domain/entities/booking.entity';
import { Subscription } from '../subscriptions/domain/entities/subscription.entity';
import { BookingsService } from './application/services/bookings.service';
import { BookingsController } from './interfaces/controllers/bookings.controller';
import { ClassesModule } from '../classes/classes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Subscription]),
    ClassesModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
