import { Component, computed, input, output } from '@angular/core';
import { DashboardFramework } from '../../../../core/dashboard/dashboard';

@Component({
  selector: 'app-framework-delete-dialog',
  templateUrl: './framework-delete-dialog.html',
  styleUrl: './framework-delete-dialog.scss',
})
export class FrameworkDeleteDialog {
  readonly framework = input<DashboardFramework | null>(null);
  readonly deleting = input(false);
  readonly error = input<string | null>(null);
  readonly confirmed = output<DashboardFramework>();
  readonly cancelled = output<void>();

  protected readonly fileCount = computed(() => this.framework()?.files.length ?? 0);
  protected readonly blockedMessage = computed(() => {
    const count = this.fileCount();
    if (count === 0) {
      return null;
    }
    const files = `${count} ${count === 1 ? 'file' : 'files'}`;
    return `It has ${files}. Delete ${count === 1 ? 'it' : 'them'} first, then delete this framework.`;
  });

  protected confirm(): void {
    const framework = this.framework();
    if (framework) {
      this.confirmed.emit(framework);
    }
  }
}
