import { Injectable } from '@nestjs/common';
import { NotificationChannelInterface, SendNotificationInput } from './notification-channel.interface';
import { NotificationsGateway } from '../../interfaces/gateways/notifications.gateway';

@Injectable()
export class InAppChannelService implements NotificationChannelInterface {
  constructor(private readonly gateway: NotificationsGateway) {}

  async send(input: SendNotificationInput): Promise<boolean> {
    this.gateway.emitNotification({
      type: input.type,
      subject: input.subject,
      body: input.body,
      timestamp: new Date().toISOString(),
    });
    return true;
  }
}
