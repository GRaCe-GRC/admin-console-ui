import { Component, input, output } from '@angular/core';
import { Authority } from '../../models/authority';

@Component({
  selector: 'app-authority-delete-dialog',
  templateUrl: './authority-delete-dialog.html',
  styleUrl: './authority-delete-dialog.scss',
})
export class AuthorityDeleteDialog {
  readonly authority = input<Authority | null>(null);
  readonly deleting = input(false);
  readonly error = input<string | null>(null);
  readonly confirmed = output<Authority>();
  readonly cancelled = output<void>();

  protected confirm(): void {
    const authority = this.authority();
    if (authority) {
      this.confirmed.emit(authority);
    }
  }
}
