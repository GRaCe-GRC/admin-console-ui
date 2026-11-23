import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardCoverage } from '../../../../core/dashboard/dashboard';
import { CoverageBar } from './coverage-bar';

describe('CoverageBar', () => {
  let fixture: ComponentFixture<CoverageBar>;
  let element: HTMLElement;

  function render(coverage: DashboardCoverage): void {
    fixture = TestBed.createComponent(CoverageBar);
    fixture.componentRef.setInput('coverage', coverage);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  }

  it('shows the share of mapped provisions as a bar, a percentage and mapped/total', () => {
    render({ mapped: 1, total: 3 });

    const coverage = element.querySelector<HTMLElement>('[data-testid="coverage"]')!;
    expect(coverage.querySelector('b')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('33% 1/3');
    expect(coverage.querySelector<HTMLElement>('.bar i')!.style.width).toBe('33%');
    expect(coverage.getAttribute('title')).toBe('1 of 3 provisions have at least one mapped control');
  });

  it('shows a full bar when every provision is mapped', () => {
    render({ mapped: 4, total: 4 });

    expect(element.querySelector<HTMLElement>('.bar i')!.style.width).toBe('100%');
  });

  it('says there are no provisions instead of a bar when the total is 0', () => {
    render({ mapped: 0, total: 0 });

    expect(element.querySelector('[data-testid="no-provisions"]')?.textContent?.trim()).toBe('No provisions yet');
    expect(element.querySelector('[data-testid="coverage"]')).toBeNull();
  });
});
