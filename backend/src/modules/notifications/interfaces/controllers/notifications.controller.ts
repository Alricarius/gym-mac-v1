import {
  Controller, Get, Patch, Param, Query, UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { NotificationsService } from '../../application/services/notifications.service';
import { QueryNotificationDto } from '../../application/dto/query-notification.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Query() query: QueryNotificationDto) {
    return this.notificationsService.findAll(query);
  }

  @Get('unread-count')
  getUnreadCount(@Query('memberId') memberId?: string) {
    return this.notificationsService.getUnreadCount(memberId);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Patch('read-all/:memberId')
  markAllAsRead(@Param('memberId') memberId: string) {
    return this.notificationsService.markAllAsRead(memberId);
  }
}
