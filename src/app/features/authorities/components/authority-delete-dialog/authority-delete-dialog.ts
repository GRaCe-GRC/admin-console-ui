import { Component, computed, input, output } from '@angular/core';
import { DashboardAuthority } from '../../../../core/dashboard/dashboard';

@Component({
  selector: 'app-authority-delete-dialog',
  templateUrl: './authority-delete-dialog.html',
  styleUrl: './authority-delete-dialog.scss',
})
export class AuthorityDeleteDialog {
  readonly authority = input<DashboardAuthority | null>(null);
  readonly deleting = input(false);
  readonly error = input<string | null>(null);
  readonly confirmed = output<DashboardAuthority>();
  readonly cancelled = output<void>();

  protected readonly frameworkCount = computed(() => this.authority()?.frameworks.length ?? 0);
  protected readonly blockedMessage = computed(() => {
    const count = this.frameworkCount();
    if (count === 0) {
      return null;
    }
    const frameworks = `${count} ${count === 1 ? 'framework' : 'frameworks'}`;
    return `It has ${frameworks}. Delete ${count === 1 ? 'it' : 'them'} first, then delete this authority.`;
  });

  protected confirm(): void {
    const authority = this.authority();
    if (authority) {
      this.confirmed.emit(authority);
    }
  }
}
