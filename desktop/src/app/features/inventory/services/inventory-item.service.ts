import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface InventoryItem {
  id: string;
  branchId: string;
  name: string;
  description?: string;
  totalQuantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  fullName: string;
}

export interface InventoryLoan {
  id: string;
  inventoryItemId: string;
  memberId: string;
  member: Member;
  quantity: number;
  loanedAt: string;
  returnedAt?: string;
  notes?: string;
}

export interface CreateInventoryItemDto {
  branchId: string;
  name: string;
  description?: string;
  totalQuantity?: number;
}

export interface UpdateInventoryItemDto extends Partial<CreateInventoryItemDto> {}

export interface CreateLoanDto {
  memberId: string;
  quantity?: number;
  notes?: string;
}

export interface ReturnLoanDto {
  loanId: string;
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
export class InventoryItemService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/inventory';

  constructor(private readonly http: HttpClient) {}

  findAll(branchId?: string, search?: string, page = 1, limit = 20): Observable<PaginatedResponse<InventoryItem>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (branchId) params = params.set('branchId', branchId);
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<InventoryItem>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<InventoryItem> {
    return this.http.get<InventoryItem>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateInventoryItemDto): Observable<InventoryItem> {
    return this.http.post<InventoryItem>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateInventoryItemDto): Observable<InventoryItem> {
    return this.http.patch<InventoryItem>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  loan(id: string, dto: CreateLoanDto): Observable<InventoryLoan> {
    return this.http.post<InventoryLoan>(`${this.apiUrl}/${id}/loan`, dto);
  }

  return(id: string, dto: ReturnLoanDto): Observable<InventoryLoan> {
    return this.http.post<InventoryLoan>(`${this.apiUrl}/${id}/return`, dto);
  }

  findActiveLoans(id: string): Observable<InventoryLoan[]> {
    return this.http.get<InventoryLoan[]>(`${this.apiUrl}/${id}/active-loans`);
  }
}
