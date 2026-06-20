import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subscription {
  id: string;
  memberId: string;
  planId: string;
  member?: { id: string; fullName: string };
  plan?: { id: string; name: string; price: number; duration: number };
  startDate: string;
  endDate: string;
  status: string;
  pausedAt?: string;
  pausedDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionDto {
  memberId: string;
  planId: string;
  startDate?: string;
  paymentMethod: 'cash' | 'card' | 'transfer';
  paymentAmount?: number;
  paymentReference?: string;
  paymentNotes?: string;
  paymentBranchId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/subscriptions';

  constructor(private readonly http: HttpClient) {}

  findAll(memberId?: string, page = 1, limit = 20): Observable<PaginatedResponse<Subscription>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (memberId) params = params.set('memberId', memberId);
    return this.http.get<PaginatedResponse<Subscription>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateSubscriptionDto): Observable<Subscription> {
    return this.http.post<Subscription>(this.apiUrl, dto);
  }

  pause(id: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/${id}/pause`, {});
  }

  resume(id: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/${id}/resume`, {});
  }

  cancel(id: string): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/${id}/cancel`, {});
  }
}
