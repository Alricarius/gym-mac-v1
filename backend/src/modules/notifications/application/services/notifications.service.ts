import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnEvent } from '@nestjs/event-emitter';
import { Notification } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { NotificationChannel } from '../../domain/enums/notification-channel.enum';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { QueryNotificationDto } from '../dto/query-notification.dto';
import { EmailChannelService } from './email-channel.service';
import { WhatsAppChannelService } from './whatsapp-channel.service';
import { InAppChannelService } from './in-app-channel.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly emailChannel: EmailChannelService,
    private readonly whatsappChannel: WhatsAppChannelService,
    private readonly inAppChannel: InAppChannelService,
  ) {}

  async sendNotification(dto: CreateNotificationDto, createdById?: string): Promise<Notification> {
    const notification = this.notificationRepo.create({
      memberId: dto.memberId,
      type: dto.type,
      channel: dto.channel,
      subject: dto.subject,
      body: dto.body,
      createdById,
    });

    const saved = await this.notificationRepo.save(notification);
    await this.dispatchToChannel(saved, dto);

    return saved;
  }

  private async dispatchToChannel(
    notification: Notification,
    dto: CreateNotificationDto,
  ): Promise<void> {
    const input = {
      to: dto.memberId || 'unknown',
      subject: dto.subject,
      body: dto.body,
      type: dto.type,
    };

    switch (dto.channel) {
      case NotificationChannel.EMAIL:
        await this.emailChannel.send(input);
        break;
      case NotificationChannel.WHATSAPP:
        await this.whatsappChannel.send(input);
        break;
      case NotificationChannel.IN_APP:
        await this.inAppChannel.send(input);
        break;
    }
  }

  async findAll(query: QueryNotificationDto) {
    const { memberId, page = 1, limit = 20 } = query;
    const where = memberId ? { memberId } : {};
    const [data, total] = await this.notificationRepo.findAndCount({
      where,
      order: { sentAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationRepo.update(id, { isRead: true, readAt: new Date() });
  }

  async markAllAsRead(memberId: string): Promise<void> {
    await this.notificationRepo.update(
      { memberId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async getUnreadCount(memberId?: string): Promise<number> {
    const where = memberId ? { memberId, isRead: false } : { isRead: false };
    return this.notificationRepo.count({ where });
  }

  @OnEvent('member.checked-in')
  async handleCheckInAlert(payload: {
    memberId: string;
    memberEmail: string;
    memberPhone: string | null;
    memberFullName: string;
    remainingDays: number;
  }) {
    if (payload.remainingDays > 7) return;

    const subject = payload.remainingDays <= 0
      ? 'Suscripción vencida'
      : `Suscripción por vencer (${payload.remainingDays} días)`;

    const body = payload.remainingDays <= 0
      ? `${payload.memberFullName} tiene la suscripción vencida.`
      : `${payload.memberFullName} tiene ${payload.remainingDays} días restantes de suscripción.`;

    const baseDto = {
      memberId: payload.memberId,
      type: NotificationType.CHECK_IN_ALERT,
      subject,
      body,
    };

    await this.sendNotification({ ...baseDto, channel: NotificationChannel.IN_APP }, undefined);

    if (payload.memberEmail) {
      await this.sendNotification({ ...baseDto, channel: NotificationChannel.EMAIL }, undefined);
    }

    if (payload.memberPhone) {
      await this.sendNotification({ ...baseDto, channel: NotificationChannel.WHATSAPP }, undefined);
    }
  }
}
