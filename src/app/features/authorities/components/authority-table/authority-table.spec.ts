import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Authority } from '../../models/authority';
import { AuthorityTable } from './authority-table';

describe('AuthorityTable', () => {
  const eba: Authority = {
    id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'European Banking Authority',
    jurisdiction: 'EU',
    createdAt: '2026-10-01T10:15:30Z',
    enabled: true,
    createdBy: 'admin-console',
  };

  let fixture: ComponentFixture<AuthorityTable>;
  let element: HTMLElement;

  function render(authorities: Authority[], loading = false): void {
    fixture = TestBed.createComponent(AuthorityTable);
    fixture.componentRef.setInput('authorities', authorities);
    fixture.componentRef.setInput('loading', loading);
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  }

  it('shows one row per authority with every column', () => {
    render([eba, { ...eba, id: '9b1d2c3e-0000-4000-8000-000000000001', name: 'FCA', enabled: false }]);

    const rows = Array.from(element.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim()),
    );
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(['European Banking Authority', 'EU', 'Yes', expect.stringContaining('2026'), 'admin-console']);
    expect(rows[1][0]).toBe('FCA');
    expect(rows[1][2]).toBe('No');
  });

  it('shows the creation time in UTC', () => {
    render([{ ...eba, createdAt: '2026-10-01T23:30:00Z' }]);

    expect(element.querySelectorAll('td')[3].textContent).toContain('11:30:00');
  });

  it('shows a message when there are no authorities', () => {
    render([]);

    expect(element.querySelector('[data-testid="empty"]')?.textContent?.trim()).toBe('No authorities yet.');
    expect(element.querySelector('table')).toBeNull();
  });

  it('shows a loading message instead of the table while loading', () => {
    render([eba], true);

    expect(element.textContent).toContain('Loading…');
    expect(element.querySelector('table')).toBeNull();
  });
});
