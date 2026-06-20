import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Branch } from '../../../core/services/branch-store.service';

export interface CreateBranchDto {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface UpdateBranchDto extends Partial<CreateBranchDto> {}

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/branches';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl);
  }

  findById(id: string): Observable<Branch> {
    return this.http.get<Branch>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateBranchDto): Observable<Branch> {
    return this.http.post<Branch>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateBranchDto): Observable<Branch> {
    return this.http.patch<Branch>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
