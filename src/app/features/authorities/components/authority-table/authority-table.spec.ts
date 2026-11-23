import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardAuthority, DashboardFramework } from '../../../../core/dashboard/dashboard';
import { AuthorityTable } from './authority-table';

describe('AuthorityTable', () => {
  const eba: DashboardAuthority = {
    id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'European Banking Authority',
    jurisdiction: 'EU',
    createdAt: '2026-10-01T10:15:30Z',
    enabled: true,
    createdBy: 'admin-console',
    frameworks: [],
  };
  const dora: DashboardFramework = {
    id: '7a6b5c4d-0000-4000-8000-000000000001',
    name: 'Digital Operational Resilience Act',
    shortName: 'DORA',
    citation: 'Regulation (EU) 2022/2554',
    enabled: true,
    createdAt: '2026-10-02T09:00:00Z',
    createdBy: 'admin-console',
    coverage: { mapped: 0, total: 0 },
    files: [],
  };

  let fixture: ComponentFixture<AuthorityTable>;
  let element: HTMLElement;

  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter([])] }));

  function render(authorities: DashboardAuthority[], loading = false): void {
    fixture = TestBed.createComponent(AuthorityTable);
    fixture.componentRef.setInput('authorities', authorities);
    fixture.componentRef.setInput('loading', loading);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  }

  function cells(row: number): HTMLTableCellElement[] {
    return Array.from(element.querySelectorAll('tbody tr')[row].querySelectorAll('td'));
  }

  it('shows the name with its short id, the jurisdiction tag and who created it', () => {
    render([eba]);

    const [authority, jurisdiction, , , , createdBy] = cells(0);
    expect(authority.querySelector('.name')?.textContent?.trim()).toBe('European Banking Authority');
    expect(authority.querySelector('.name-id')?.textContent?.trim()).toBe('3f2c1a9e');
    expect(jurisdiction.querySelector('.juris')?.textContent?.trim()).toBe('EU');
    expect(createdBy.textContent?.trim()).toBe('admin-console');
  });

  it('links the name to the authority page', () => {
    render([eba]);

    const link = element.querySelector<HTMLAnchorElement>('[data-testid="open-3f2c1a9e"]')!;
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).toBe('/authorities/3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40');
  });

  it('shows how many frameworks each authority has', () => {
    render([
      eba,
      { ...eba, id: '9b1d2c3e-0000-4000-8000-000000000001', frameworks: [dora] },
      {
        ...eba,
        id: '9b1d2c3e-0000-4000-8000-000000000002',
        frameworks: [dora, { ...dora, id: 'other' }],
      },
    ]);

    expect([0, 1, 2].map((row) => cells(row)[2].querySelector('.count-chip')?.textContent?.trim())).toEqual([
      '0 frameworks',
      '1 framework',
      '2 frameworks',
    ]);
  });

  it('shows an Enabled or Disabled status pill', () => {
    render([eba, { ...eba, id: '9b1d2c3e-0000-4000-8000-000000000001', name: 'FCA', enabled: false }]);

    const enabled = cells(0)[3].querySelector('.pill')!;
    const disabled = cells(1)[3].querySelector('.pill')!;
    expect(enabled.textContent?.trim()).toBe('Enabled');
    expect(enabled.classList).toContain('on');
    expect(disabled.textContent?.trim()).toBe('Disabled');
    expect(disabled.classList).toContain('off');
  });

  it('shows the creation date and time in UTC', () => {
    render([{ ...eba, createdAt: '2026-10-01T23:30:00Z' }]);

    const created = cells(0)[4];
    expect(created.firstChild?.textContent?.trim()).toBe('01 Oct 2026');
    expect(created.querySelector('small')?.textContent?.trim()).toBe('23:30 UTC');
  });

  it('emits the authority to remove from its delete button', () => {
    render([eba]);
    const removed: DashboardAuthority[] = [];
    fixture.componentInstance.remove.subscribe((authority) => removed.push(authority));

    const button = element.querySelector<HTMLButtonElement>('[data-testid="delete-3f2c1a9e"]')!;
    expect(button.getAttribute('aria-label')).toBe('Delete European Banking Authority');
    button.click();

    expect(removed).toEqual([eba]);
  });

  it('shows a message when there are no authorities', () => {
    render([]);

    expect(element.querySelector('[data-testid="empty"]')?.textContent?.trim()).toBe(
      'No authorities yet. Use the + button to add the first one.',
    );
    expect(element.querySelector('table')).toBeNull();
  });

  it('shows a loading message instead of the table while loading', () => {
    render([eba], true);

    expect(element.querySelector('[data-testid="loading"]')?.textContent?.trim()).toBe('Loading authorities…');
    expect(element.querySelector('table')).toBeNull();
  });
});
