import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { DashboardFramework } from '../../../../core/dashboard/dashboard';
import { CoverageBar } from '../coverage-bar/coverage-bar';

@Component({
  selector: 'app-framework-table',
  imports: [CoverageBar, DatePipe],
  templateUrl: './framework-table.html',
  styleUrl: './framework-table.scss',
})
export class FrameworkTable {
  readonly frameworks = input.required<DashboardFramework[]>();
  readonly remove = output<DashboardFramework>();

  protected shortId(framework: DashboardFramework): string {
    return framework.id.slice(0, 8);
  }

  protected filesLabel(framework: DashboardFramework): string {
    const count = framework.files.length;
    return `${count} ${count === 1 ? 'file' : 'files'}`;
  }
}
