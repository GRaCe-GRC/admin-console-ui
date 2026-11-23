import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Dashboard } from './dashboard';
import { DashboardApi } from './dashboard-api';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly api = inject(DashboardApi);
  private readonly current = signal<Dashboard | null>(null);
  private readonly pending = signal(false);
  private readonly failed = signal(false);
  private request: Subscription | undefined;

  readonly dashboard = this.current.asReadonly();
  readonly loading = this.pending.asReadonly();
  readonly loadFailed = this.failed.asReadonly();
  readonly authorities = computed(() => this.current()?.authorities ?? []);

  load(): void {
    if (this.current() === null && !this.pending()) {
      this.reload();
    }
  }

  reload(): void {
    this.request?.unsubscribe();
    this.pending.set(true);
    this.failed.set(false);
    this.request = this.api.get().subscribe({
      next: (dashboard) => {
        this.current.set(dashboard);
        this.pending.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.pending.set(false);
      },
    });
  }
}
