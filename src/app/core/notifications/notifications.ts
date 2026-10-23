import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Notifications {
  static readonly DURATION_MS = 2600;

  private readonly current = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly message = this.current.asReadonly();

  show(text: string): void {
    clearTimeout(this.timer);
    this.current.set(text);
    this.timer = setTimeout(() => this.current.set(null), Notifications.DURATION_MS);
  }

  dismiss(): void {
    clearTimeout(this.timer);
    this.current.set(null);
  }
}
