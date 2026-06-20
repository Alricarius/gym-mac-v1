export interface Notification {
  id: string;
  memberId?: string;
  type: 'subscription_expiring' | 'booking_reminder' | 'check_in_alert';
  channel: 'email' | 'whatsapp' | 'in_app';
  subject: string;
  body: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}
