import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardAuthority } from '../../../../core/dashboard/dashboard';
import { AuthorityDeleteDialog } from './authority-delete-dialog';

describe('AuthorityDeleteDialog', () => {
  const eba: DashboardAuthority = {
    id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'European Banking Authority',
    jurisdiction: 'EU',
    createdAt: '2026-10-01T10:15:30Z',
    enabled: true,
    createdBy: 'admin-console',
    frameworks: [],
  };

  let fixture: ComponentFixture<AuthorityDeleteDialog>;
  let element: HTMLElement;
  let confirmed: DashboardAuthority[];
  let cancelled: number;

  function render(authority: DashboardAuthority | null, inputs: { deleting?: boolean; error?: string | null } = {}): void {
    fixture = TestBed.createComponent(AuthorityDeleteDialog);
    element = fixture.nativeElement as HTMLElement;
    confirmed = [];
    cancelled = 0;
    fixture.componentInstance.confirmed.subscribe((value) => confirmed.push(value));
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    fixture.componentRef.setInput('authority', authority);
    fixture.componentRef.setInput('deleting', inputs.deleting ?? false);
    fixture.componentRef.setInput('error', inputs.error ?? null);
    fixture.detectChanges();
  }

  function button(testId: string): HTMLButtonElement {
    return element.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)!;
  }

  it('asks to confirm and names the authority', () => {
    render(eba);

    expect(element.querySelector('#delete-title')?.textContent?.trim()).toBe('Delete authority?');
    expect(element.querySelector('[data-testid="delete-text"]')?.textContent?.replace(/\s+/g, ' ').trim()).toBe(
      'European Banking Authority will be removed from the regulatory database. This cannot be undone.',
    );
  });

  it('emits the authority when Delete is pressed', () => {
    render(eba);

    button('confirm-delete').click();

    expect(confirmed).toEqual([eba]);
  });

  it('emits cancelled from Cancel and from the close button', () => {
    render(eba);

    button('cancel-delete').click();
    button('delete-close').click();

    expect(cancelled).toBe(2);
    expect(confirmed).toEqual([]);
  });

  it('disables Delete while deleting and when there is no authority', () => {
    render(eba, { deleting: true });
    expect(button('confirm-delete').disabled).toBe(true);

    render(null);
    expect(button('confirm-delete').disabled).toBe(true);
    expect(element.querySelector('[data-testid="delete-text"]')).toBeNull();
  });

  it('does not emit when confirmed without an authority', () => {
    render(null);

    (fixture.componentInstance as unknown as { confirm(): void }).confirm();

    expect(confirmed).toEqual([]);
  });

  it('shows the error message', () => {
    render(eba, { error: 'The authority could not be deleted. Try again later.' });

    expect(element.querySelector('[data-testid="delete-error"]')?.textContent?.trim()).toBe(
      'The authority could not be deleted. Try again later.',
    );
  });

  it('explains that the frameworks must be deleted first and offers no Delete button', () => {
    const framework = {
      id: '7a6b5c4d-0000-4000-8000-000000000001',
      name: 'DORA',
      shortName: null,
      citation: null,
      enabled: true,
      createdAt: '2026-10-02T09:00:00Z',
      createdBy: 'admin-console',
      coverage: { mapped: 0, total: 0 },
      files: [],
    };
    render({ ...eba, frameworks: [framework, { ...framework, id: 'other' }] });

    expect(element.querySelector('[data-testid="delete-text"]')?.textContent?.trim()).toBe('European Banking Authority');
    expect(element.querySelector('[data-testid="delete-blocked"]')?.textContent?.trim()).toBe(
      'It has 2 frameworks. Delete them first, then delete this authority.',
    );
    expect(element.querySelector('[data-testid="confirm-delete"]')).toBeNull();
    expect(button('cancel-delete').textContent?.trim()).toBe('Close');

    render({ ...eba, frameworks: [framework] });
    expect(element.querySelector('[data-testid="delete-blocked"]')?.textContent?.trim()).toBe(
      'It has 1 framework. Delete it first, then delete this authority.',
    );
  });

  it('shows no blocked notice for an authority without frameworks', () => {
    render(eba);

    expect(element.querySelector('[data-testid="delete-blocked"]')).toBeNull();
    expect(button('cancel-delete').textContent?.trim()).toBe('Cancel');
  });
});
