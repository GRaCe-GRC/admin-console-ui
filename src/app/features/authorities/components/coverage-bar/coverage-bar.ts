import { Component, computed, input } from '@angular/core';
import { DashboardCoverage } from '../../../../core/dashboard/dashboard';

@Component({
  selector: 'app-coverage-bar',
  templateUrl: './coverage-bar.html',
  styleUrl: './coverage-bar.scss',
})
export class CoverageBar {
  readonly coverage = input.required<DashboardCoverage>();

  protected readonly percent = computed(() => {
    const { mapped, total } = this.coverage();
    return total ? Math.round((100 * mapped) / total) : 0;
  });
}
