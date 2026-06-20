import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  id: string;
  subscriptionId: string;
  memberId: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
  notes?: string;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
  subscription?: {
    id: string;
    startDate: string;
    endDate: string;
    status: string;
    member?: { id: string; fullName: string };
    plan?: { id: string; name: string; price: number };
  };
  member?: { id: string; fullName: string };
}

export interface CreatePaymentDto {
  subscriptionId: string;
  amount?: number;
  method: 'cash' | 'card' | 'transfer';
  reference?: string;
  notes?: string;
  paidAt?: string;
  branchId?: string;
}

export interface Receipt {
  receiptNumber: string;
  member: string;
  plan: string;
  amount: number;
  method: string;
  reference?: string;
  paidAt: string;
  subscriptionStart: string;
  subscriptionEnd: string;
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
export class PaymentService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/payments';

  constructor(private readonly http: HttpClient) {}

  findAll(memberId?: string, page = 1, limit = 20): Observable<PaginatedResponse<Payment>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (memberId) params = params.set('memberId', memberId);
    return this.http.get<PaginatedResponse<Payment>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreatePaymentDto): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, dto);
  }

  getReceipt(id: string): Observable<Receipt> {
    return this.http.get<Receipt>(`${this.apiUrl}/${id}/receipt`);
  }
}
