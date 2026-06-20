import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GymConfig {
  id: string;
  gymName: string;
  address: string;
  phone: string;
  openingHours: Record<string, string> | null;
  cancellationPolicy: string;
  graceDays: number;
  taxRate: number;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateGymConfigDto {
  gymName: string;
  address?: string;
  phone?: string;
  openingHours?: Record<string, string>;
  cancellationPolicy?: string;
  graceDays?: number;
  taxRate?: number;
  timezone?: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/settings';

  constructor(private readonly http: HttpClient) {}

  get(): Observable<GymConfig> {
    return this.http.get<GymConfig>(this.apiUrl);
  }

  update(dto: UpdateGymConfigDto): Observable<GymConfig> {
    return this.http.put<GymConfig>(this.apiUrl, dto);
  }
}
