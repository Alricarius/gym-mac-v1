import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  fullName: string;
  password: string;
  role?: string;
}

export type UpdateUserDto = Partial<CreateUserDto>;

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = 'http://localhost:3000/api/v1/users';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<SystemUser[]> {
    return this.http.get<SystemUser[]>(this.apiUrl);
  }

  findById(id: string): Observable<SystemUser> {
    return this.http.get<SystemUser>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateUserDto): Observable<SystemUser> {
    return this.http.post<SystemUser>(this.apiUrl, dto);
  }

  update(id: string, dto: UpdateUserDto): Observable<SystemUser> {
    return this.http.patch<SystemUser>(`${this.apiUrl}/${id}`, dto);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
