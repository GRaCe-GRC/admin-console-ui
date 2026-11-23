import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardFile, DashboardFramework } from '../../../../core/dashboard/dashboard';
import { FrameworkDeleteDialog } from './framework-delete-dialog';

describe('FrameworkDeleteDialog', () => {
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
  const file: DashboardFile = {
    id: '5e4d3c2b-0000-4000-8000-000000000001',
    title: 'DORA (EUR-Lex)',
    sourceUrl: null,
    versionLabel: null,
    publicationDate: null,
    createdAt: '2026-10-03T09:00:00Z',
    createdBy: 'admin-console',
    coverage: { mapped: 0, total: 0 },
    requirements: [],
  };

  let fixture: ComponentFixture<FrameworkDeleteDialog>;
  let element: HTMLElement;
  let confirmed: DashboardFramework[];
  let cancelled: number;

  function render(framework: DashboardFramework | null, inputs: { deleting?: boolean; error?: string | null } = {}): void {
    fixture = TestBed.createComponent(FrameworkDeleteDialog);
    element = fixture.nativeElement as HTMLElement;
    confirmed = [];
    cancelled = 0;
    fixture.componentInstance.confirmed.subscribe((value) => confirmed.push(value));
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    fixture.componentRef.setInput('framework', framework);
    fixture.componentRef.setInput('deleting', inputs.deleting ?? false);
    fixture.componentRef.setInput('error', inputs.error ?? null);
    fixture.detectChanges();
  }

  function button(testId: string): HTMLButtonElement {
    return element.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`)!;
  }

  function text(testId: string): string | undefined {
    return element.querySelector(`[data-testid="${testId}"]`)?.textContent?.replace(/\s+/g, ' ').trim();
  }

  it('asks to confirm and names the framework', () => {
    render(dora);

    expect(element.querySelector('#framework-delete-title')?.textContent?.trim()).toBe('Delete framework?');
    expect(text('framework-delete-text')).toBe(
      'Digital Operational Resilience Act will be removed from the regulatory database. This cannot be undone.',
    );
    expect(element.querySelector('[data-testid="framework-delete-blocked"]')).toBeNull();
    expect(button('cancel-framework-delete').textContent?.trim()).toBe('Cancel');
  });

  it('emits the framework when Delete is pressed', () => {
    render(dora);

    button('confirm-framework-delete').click();

    expect(confirmed).toEqual([dora]);
  });

  it('emits cancelled from Cancel and from the close button', () => {
    render(dora);

    button('cancel-framework-delete').click();
    button('framework-delete-close').click();

    expect(cancelled).toBe(2);
    expect(confirmed).toEqual([]);
  });

  it('disables Delete while deleting and when there is no framework', () => {
    render(dora, { deleting: true });
    expect(button('confirm-framework-delete').disabled).toBe(true);

    render(null);
    expect(button('confirm-framework-delete').disabled).toBe(true);
    expect(element.querySelector('[data-testid="framework-delete-text"]')).toBeNull();
  });

  it('does not emit when confirmed without a framework', () => {
    render(null);

    (fixture.componentInstance as unknown as { confirm(): void }).confirm();

    expect(confirmed).toEqual([]);
  });

  it('explains that the files must be deleted first and offers no Delete button', () => {
    render({ ...dora, files: [file, { ...file, id: 'other' }] });

    expect(text('framework-delete-text')).toBe('Digital Operational Resilience Act');
    expect(text('framework-delete-blocked')).toBe('It has 2 files. Delete them first, then delete this framework.');
    expect(element.querySelector('[data-testid="confirm-framework-delete"]')).toBeNull();
    expect(button('cancel-framework-delete').textContent?.trim()).toBe('Close');

    render({ ...dora, files: [file] });
    expect(text('framework-delete-blocked')).toBe('It has 1 file. Delete it first, then delete this framework.');
  });

  it('shows the error message', () => {
    render(dora, { error: 'The framework could not be deleted. Try again later.' });

    expect(text('framework-delete-error')).toBe('The framework could not be deleted. Try again later.');
  });
});
