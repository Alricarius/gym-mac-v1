import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../subscriptions/domain/entities/subscription.entity';
import { Booking } from '../bookings/domain/entities/booking.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { SubscriptionExpirationTask } from './subscription-expiration.task';
import { BookingReminderTask } from './booking-reminder.task';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, Booking]),
    NotificationsModule,
  ],
  providers: [
    SubscriptionExpirationTask,
    BookingReminderTask,
  ],
})
export class TasksModule {}
