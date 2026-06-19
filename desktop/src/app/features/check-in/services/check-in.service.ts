import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VerifyResponse {
  canEnter: boolean;
  reason?: string;
  member?: { id: string; fullName: string; photoUrl?: string };
  subscription?: { id: string; endDate: string; status: string };
}

export interface CheckInResponse {
  id: string;
  memberId: string;
  type: string;
  createdAt: string;
  member: { id: string; fullName: string; photoUrl?: string };
}

export interface ActiveMember {
  id: string;
  memberId: string;
  fullName: string;
  photoUrl?: string;
  createdAt: string;
  type: string;
}

export interface CreateCheckInDto {
  memberId: string;
  type: 'entry' | 'exit';
}

@Injectable({ providedIn: 'root' })
export class CheckInService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/check-in';

  constructor(private readonly http: HttpClient) {}

  verify(memberId: string): Observable<VerifyResponse> {
    return this.http.get<VerifyResponse>(`${this.apiUrl}/verify/${memberId}`);
  }

  checkIn(dto: CreateCheckInDto): Observable<CheckInResponse> {
    return this.http.post<CheckInResponse>(this.apiUrl, dto);
  }

  checkOut(dto: CreateCheckInDto): Observable<CheckInResponse> {
    return this.http.post<CheckInResponse>(this.apiUrl, dto);
  }

  getActive(): Observable<ActiveMember[]> {
    return this.http.get<ActiveMember[]>(`${this.apiUrl}/active`);
  }
}
