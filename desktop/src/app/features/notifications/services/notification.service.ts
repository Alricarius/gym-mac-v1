import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedNotifications, Notification } from '../interfaces/notification.interface';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/notifications';

  constructor(private readonly http: HttpClient) {}

  findAll(query?: {
    memberId?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedNotifications> {
    let params = new HttpParams();
    if (query?.memberId) params = params.set('memberId', query.memberId);
    if (query?.page) params = params.set('page', String(query.page));
    if (query?.limit) params = params.set('limit', String(query.limit));
    return this.http.get<PaginatedNotifications>(this.apiUrl, { params });
  }

  getUnreadCount(memberId?: string): Observable<number> {
    let params = new HttpParams();
    if (memberId) params = params.set('memberId', memberId);
    return this.http.get<number>(`${this.apiUrl}/unread-count`, { params });
  }

  markAsRead(id: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(memberId: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/read-all/${memberId}`, {});
  }
}
