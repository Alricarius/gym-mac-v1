import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Member {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  photoUrl?: string;
  notes?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberDto {
  fullName: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  gender?: string;
  address?: string;
  photoUrl?: string;
  notes?: string;
}

export interface UpdateMemberDto extends Partial<CreateMemberDto> {}

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
export class MemberService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/members';

  constructor(private readonly http: HttpClient) {}

  findAll(search?: string, page = 1, limit = 20): Observable<PaginatedResponse<Member>> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    return this.http.get<PaginatedResponse<Member>>(this.apiUrl, { params });
  }

  findById(id: string): Observable<Member> {
    return this.http.get<Member>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateMemberDto): Observable<Member> {
    return this.http.post<Member>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateMemberDto): Observable<Member> {
    return this.http.patch<Member>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
