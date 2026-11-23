import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardAuthority } from '../../../../core/dashboard/dashboard';

@Component({
  selector: 'app-authority-table',
  imports: [DatePipe, RouterLink],
  templateUrl: './authority-table.html',
  styleUrl: './authority-table.scss',
})
export class AuthorityTable {
  readonly authorities = input.required<DashboardAuthority[]>();
  readonly loading = input(false);
  readonly remove = output<DashboardAuthority>();

  protected shortId(authority: DashboardAuthority): string {
    return authority.id.slice(0, 8);
  }

  protected frameworksLabel(authority: DashboardAuthority): string {
    const count = authority.frameworks.length;
    return `${count} ${count === 1 ? 'framework' : 'frameworks'}`;
  }
}
