import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Plan {
  id: string;
  name: string;
  duration: number;
  price: number;
  classCount?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanDto {
  name: string;
  duration: number;
  price: number;
  classCount?: number;
  description?: string;
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

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
export class PlanService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/plans';

  constructor(private readonly http: HttpClient) {}

  findAll(search?: string, page = 1, limit = 20): Observable<PaginatedResponse<Plan>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<Plan>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Plan> {
    return this.http.get<Plan>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreatePlanDto): Observable<Plan> {
    return this.http.post<Plan>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdatePlanDto): Observable<Plan> {
    return this.http.patch<Plan>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
