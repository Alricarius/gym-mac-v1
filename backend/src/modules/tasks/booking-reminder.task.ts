import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from '../../modules/bookings/domain/entities/booking.entity';
import { NotificationsService } from '../../modules/notifications/application/services/notifications.service';
import { NotificationType } from '../../modules/notifications/domain/enums/notification-type.enum';
import { NotificationChannel } from '../../modules/notifications/domain/enums/notification-channel.enum';

@Injectable()
export class BookingReminderTask {
  private readonly logger = new Logger(BookingReminderTask.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron('*/30 * * * *')
  async handleBookingReminders() {
    this.logger.log('Checking for upcoming bookings...');

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetStart = currentMinutes;
    const targetEnd = currentMinutes + 30;

    const bookings = await this.bookingRepo.find({
      where: {
        bookingDate: today,
        status: BookingStatus.CONFIRMED,
      },
      relations: ['member', 'schedule', 'gymClass'],
    });

    let count = 0;
    for (const booking of bookings) {
      const [hours, minutes] = booking.schedule.startTime.split(':').map(Number);
      const scheduleMinutes = hours * 60 + minutes;

      if (scheduleMinutes >= targetStart && scheduleMinutes < targetEnd) {
        const member = booking.member;
        if (!member) continue;

        const subject = `Recordatorio de clase - ${booking.gymClass.name}`;
        const body = `${member.fullName} tiene "${booking.gymClass.name}" a las ${booking.schedule.startTime}.`;

        await this.notificationsService.sendNotification({
          memberId: member.id,
          type: NotificationType.BOOKING_REMINDER,
          channel: NotificationChannel.IN_APP,
          subject,
          body,
        });

        if (member.email) {
          await this.notificationsService.sendNotification({
            memberId: member.id,
            type: NotificationType.BOOKING_REMINDER,
            channel: NotificationChannel.EMAIL,
            subject,
            body,
          });
        }

        count++;
      }
    }

    if (count > 0) {
      this.logger.log(`Sent ${count} booking reminders`);
    }
  }
}
