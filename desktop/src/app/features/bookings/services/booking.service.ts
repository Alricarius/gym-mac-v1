import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id: string;
  classId: string;
  scheduleId: string;
  memberId: string;
  bookingDate: string;
  status: string;
  gymClass?: { id: string; name: string; color?: string };
  schedule?: { id: string; dayOfWeek: number; startTime: string; endTime: string };
  member?: { id: string; fullName: string };
  createdAt: string;
}

export interface CreateBookingDto {
  classId: string;
  scheduleId: string;
  memberId: string;
  bookingDate: string;
}

export interface UpdateBookingDto {
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/bookings';

  constructor(private readonly http: HttpClient) {}

  findAll(classId?: string, memberId?: string, date?: string, page = 1, limit = 20): Observable<PaginatedResponse<Booking>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (classId) params = params.set('classId', classId);
    if (memberId) params = params.set('memberId', memberId);
    if (date) params = params.set('date', date);
    return this.http.get<PaginatedResponse<Booking>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateBookingDto): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, dto);
  }

  updateStatus(id: string, dto: UpdateBookingDto): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
