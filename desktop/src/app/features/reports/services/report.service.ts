import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardData {
  todayIncome: number;
  activeMembers: number;
  totalMembers: number;
  todayCheckIns: number;
  activeSubscriptions: number;
  incomeLast7Days: { date: string; total: number }[];
}

export interface IncomeRow {
  date: string;
  total: number;
  count: number;
}

export interface IncomeReport {
  data: IncomeRow[];
  total: number;
  from: string;
  to: string;
}

export interface MemberReport {
  newMembers: number;
  activeMembers: number;
  cancelledSubscriptions: number;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/reports';

  constructor(private readonly http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`);
  }

  getIncome(from: string, to: string): Observable<IncomeReport> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.http.get<IncomeReport>(`${this.apiUrl}/income`, { params });
  }

  getMembers(): Observable<MemberReport> {
    return this.http.get<MemberReport>(`${this.apiUrl}/members`);
  }
}
