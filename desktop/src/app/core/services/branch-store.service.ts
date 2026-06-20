import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class BranchStore {
  private readonly apiUrl = 'http://localhost:3000/api/v1/branches';

  readonly branches = signal<Branch[]>([]);
  readonly selectedBranch = signal<Branch | null>(null);
  readonly loading = signal(false);

  constructor(private readonly http: HttpClient) {}

  loadBranches(): void {
    this.loading.set(true);
    this.http.get<Branch[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.branches.set(data);
        if (data.length > 0 && !this.selectedBranch()) {
          this.selectedBranch.set(data[0]);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectBranch(branch: Branch): void {
    this.selectedBranch.set(branch);
  }
}
