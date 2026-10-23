import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Authority } from '../../models/authority';

@Component({
  selector: 'app-authority-table',
  imports: [DatePipe],
  templateUrl: './authority-table.html',
  styleUrl: './authority-table.scss',
})
export class AuthorityTable {
  readonly authorities = input.required<Authority[]>();
  readonly loading = input(false);
  readonly remove = output<Authority>();

  protected shortId(authority: Authority): string {
    return authority.id.slice(0, 8);
  }
}
