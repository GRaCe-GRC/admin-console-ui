import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardFile, DashboardFramework } from '../../../../core/dashboard/dashboard';
import { FrameworkTable } from './framework-table';

describe('FrameworkTable', () => {
  const file: DashboardFile = {
    id: '5e4d3c2b-0000-4000-8000-000000000001',
    title: 'DORA (EUR-Lex)',
    sourceUrl: null,
    versionLabel: null,
    publicationDate: '2022-12-27',
    createdAt: '2026-10-03T09:00:00Z',
    createdBy: 'admin-console',
    coverage: { mapped: 1, total: 3 },
    requirements: [],
  };
  const dora: DashboardFramework = {
    id: '7a6b5c4d-0000-4000-8000-000000000001',
    name: 'Digital Operational Resilience Act',
    shortName: 'DORA',
    citation: 'Regulation (EU) 2022/2554',
    enabled: true,
    createdAt: '2026-10-02T23:30:00Z',
    createdBy: 'admin-console',
    coverage: { mapped: 1, total: 3 },
    files: [file],
  };

  let fixture: ComponentFixture<FrameworkTable>;
  let element: HTMLElement;

  function render(frameworks: DashboardFramework[]): void {
    fixture = TestBed.createComponent(FrameworkTable);
    fixture.componentRef.setInput('frameworks', frameworks);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  }

  function cells(row: number): HTMLTableCellElement[] {
    return Array.from(element.querySelectorAll('tbody tr')[row].querySelectorAll('td'));
  }

  it('shows the name with its citation, the short name, files, coverage, status and creation date', () => {
    render([dora]);

    const [framework, shortName, files, coverage, status, created] = cells(0);
    expect(framework.querySelector('.name')?.textContent?.trim()).toBe('Digital Operational Resilience Act');
    expect(framework.querySelector('.sub')?.textContent?.trim()).toBe('Regulation (EU) 2022/2554');
    expect(shortName.querySelector('.tag')?.textContent?.trim()).toBe('DORA');
    expect(files.querySelector('.count-chip')?.textContent?.trim()).toBe('1 file');
    expect(coverage.querySelector('b')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('33% 1/3');
    expect(status.querySelector('.pill')?.textContent?.trim()).toBe('Enabled');
    expect(status.querySelector('.pill')?.classList).toContain('on');
    expect(created.textContent?.trim()).toBe('02 Oct 2026');
  });

  it('counts files in the plural and shows a disabled framework', () => {
    render([{ ...dora, enabled: false, files: [file, { ...file, id: 'other' }] }]);

    expect(cells(0)[2].textContent?.trim()).toBe('2 files');
    expect(cells(0)[4].querySelector('.pill')?.classList).toContain('off');
    expect(cells(0)[4].textContent?.trim()).toBe('Disabled');
  });

  it('leaves out a missing citation and short name', () => {
    render([{ ...dora, shortName: null, citation: null, files: [], coverage: { mapped: 0, total: 0 } }]);

    expect(cells(0)[0].querySelector('.sub')).toBeNull();
    expect(cells(0)[1].querySelector('.tag')).toBeNull();
    expect(cells(0)[2].textContent?.trim()).toBe('0 files');
    expect(cells(0)[3].textContent?.trim()).toBe('No provisions yet');
  });

  it('emits the framework to remove from its delete button', () => {
    render([dora]);
    const removed: DashboardFramework[] = [];
    fixture.componentInstance.remove.subscribe((framework) => removed.push(framework));

    const button = element.querySelector<HTMLButtonElement>('[data-testid="delete-7a6b5c4d"]')!;
    expect(button.getAttribute('aria-label')).toBe('Delete Digital Operational Resilience Act');
    button.click();

    expect(removed).toEqual([dora]);
  });

  it('shows a message when the authority has no frameworks', () => {
    render([]);

    expect(element.querySelector('[data-testid="empty"]')?.textContent?.trim()).toBe(
      'This authority has no frameworks yet. Use the + button to add one.',
    );
    expect(element.querySelector('table')).toBeNull();
  });
});
