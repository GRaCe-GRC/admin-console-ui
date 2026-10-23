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

  function cells(row: number): HTMLTableCellElement[] {
    return Array.from(element.querySelectorAll('tbody tr')[row].querySelectorAll('td'));
  }

  it('shows the name with its short id, the jurisdiction tag and who created it', () => {
    render([eba]);

    const [authority, jurisdiction, , , createdBy] = cells(0);
    expect(authority.querySelector('.name')?.textContent?.trim()).toBe('European Banking Authority');
    expect(authority.querySelector('.name-id')?.textContent?.trim()).toBe('3f2c1a9e');
    expect(jurisdiction.querySelector('.juris')?.textContent?.trim()).toBe('EU');
    expect(createdBy.textContent?.trim()).toBe('admin-console');
  });

  it('shows an Enabled or Disabled status pill', () => {
    render([eba, { ...eba, id: '9b1d2c3e-0000-4000-8000-000000000001', name: 'FCA', enabled: false }]);

    const enabled = cells(0)[2].querySelector('.pill')!;
    const disabled = cells(1)[2].querySelector('.pill')!;
    expect(enabled.textContent?.trim()).toBe('Enabled');
    expect(enabled.classList).toContain('on');
    expect(disabled.textContent?.trim()).toBe('Disabled');
    expect(disabled.classList).toContain('off');
  });

  it('shows the creation date and time in UTC', () => {
    render([{ ...eba, createdAt: '2026-10-01T23:30:00Z' }]);

    const created = cells(0)[3];
    expect(created.firstChild?.textContent?.trim()).toBe('01 Oct 2026');
    expect(created.querySelector('small')?.textContent?.trim()).toBe('23:30 UTC');
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
