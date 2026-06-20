import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Schedule {
  id: string;
  classId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface GymClass {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  color?: string;
  isActive: boolean;
  schedules: Schedule[];
  createdAt: string;
}

export interface CreateClassDto {
  name: string;
  description?: string;
  capacity: number;
  color?: string;
}

export interface UpdateClassDto extends Partial<CreateClassDto> {}

export interface CreateScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ClassService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/classes';

  constructor(private readonly http: HttpClient) {}

  findAll(name?: string, isActive?: string, page = 1, limit = 20): Observable<PaginatedResponse<GymClass>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (name) params = params.set('name', name);
    if (isActive) params = params.set('isActive', isActive);
    return this.http.get<PaginatedResponse<GymClass>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<GymClass> {
    return this.http.get<GymClass>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateClassDto): Observable<GymClass> {
    return this.http.post<GymClass>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateClassDto): Observable<GymClass> {
    return this.http.patch<GymClass>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  addSchedule(classId: string, dto: CreateScheduleDto): Observable<Schedule> {
    return this.http.post<Schedule>(`${this.apiUrl}/${classId}/schedules`, dto);
  }

  removeSchedule(classId: string, scheduleId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${classId}/schedules/${scheduleId}`);
  }
}
