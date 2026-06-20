import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription, SubscriptionStatus } from '../../modules/subscriptions/domain/entities/subscription.entity';
import { NotificationsService } from '../../modules/notifications/application/services/notifications.service';
import { NotificationType } from '../../modules/notifications/domain/enums/notification-type.enum';
import { NotificationChannel } from '../../modules/notifications/domain/enums/notification-channel.enum';

@Injectable()
export class SubscriptionExpirationTask {
  private readonly logger = new Logger(SubscriptionExpirationTask.name);

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleExpiringSubscriptions() {
    this.logger.log('Checking for expiring subscriptions...');

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const target = targetDate.toISOString().split('T')[0];

    const subscriptions = await this.subscriptionRepo.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: target,
      },
      relations: ['member'],
    });

    for (const sub of subscriptions) {
      const member = sub.member;
      if (!member) continue;

      const subject = `Suscripción por vencer - ${member.fullName}`;
      const body = `La suscripción de ${member.fullName} vence el ${sub.endDate}. Quedan 3 días.`;

      await this.notificationsService.sendNotification({
        memberId: member.id,
        type: NotificationType.SUBSCRIPTION_EXPIRING,
        channel: NotificationChannel.IN_APP,
        subject,
        body,
      });

      if (member.email) {
        await this.notificationsService.sendNotification({
          memberId: member.id,
          type: NotificationType.SUBSCRIPTION_EXPIRING,
          channel: NotificationChannel.EMAIL,
          subject,
          body,
        });
      }

      if (member.phone) {
        await this.notificationsService.sendNotification({
          memberId: member.id,
          type: NotificationType.SUBSCRIPTION_EXPIRING,
          channel: NotificationChannel.WHATSAPP,
          subject,
          body,
        });
      }
    }

    this.logger.log(`Processed ${subscriptions.length} expiring subscriptions`);
  }
}
