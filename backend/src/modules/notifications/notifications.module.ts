import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './domain/entities/notification.entity';
import { NotificationsService } from './application/services/notifications.service';
import { NotificationsController } from './interfaces/controllers/notifications.controller';
import { NotificationsGateway } from './interfaces/gateways/notifications.gateway';
import { EmailChannelService } from './application/services/email-channel.service';
import { WhatsAppChannelService } from './application/services/whatsapp-channel.service';
import { InAppChannelService } from './application/services/in-app-channel.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    EmailChannelService,
    WhatsAppChannelService,
    InAppChannelService,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
