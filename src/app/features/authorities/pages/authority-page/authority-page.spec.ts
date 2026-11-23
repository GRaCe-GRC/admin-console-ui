import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { polyfillDialog } from '../../../../../testing/dialog';
import { Dashboard, DashboardAuthority, DashboardFile, DashboardFramework } from '../../../../core/dashboard/dashboard';
import { DashboardApi } from '../../../../core/dashboard/dashboard-api';
import { Notifications } from '../../../../core/notifications/notifications';
import { FrameworkApi } from '../../data-access/framework-api';
import { CreateFrameworkRequest } from '../../models/framework';
import { AuthorityPage } from './authority-page';

describe('AuthorityPage', () => {
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
    createdAt: '2026-10-02T09:00:00Z',
    createdBy: 'admin-console',
    coverage: { mapped: 1, total: 3 },
    files: [file],
  };
  const mica: DashboardFramework = {
    ...dora,
    id: '8b7c6d5e-0000-4000-8000-000000000002',
    name: 'Markets in Crypto-Assets',
    shortName: 'MiCA',
    coverage: { mapped: 0, total: 0 },
    files: [],
  };
  const eba: DashboardAuthority = {
    id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'European Banking Authority',
    jurisdiction: 'EU',
    enabled: true,
    createdAt: '2026-10-01T10:15:30Z',
    createdBy: 'admin-console',
    frameworks: [dora, mica],
  };

  function dashboardOf(...authorities: DashboardAuthority[]): Observable<Dashboard> {
    return of({ authorities, controlGroups: [], ungroupedControls: [] });
  }

  let get: ReturnType<typeof vi.fn<() => Observable<Dashboard>>>;
  let create: ReturnType<typeof vi.fn<(request: CreateFrameworkRequest) => Observable<void>>>;
  let remove: ReturnType<typeof vi.fn<(id: string) => Observable<void>>>;
  let show: ReturnType<typeof vi.fn<(text: string) => void>>;
  let fixture: ComponentFixture<AuthorityPage>;
  let page: HTMLElement;

  async function render(id = eba.id): Promise<void> {
    fixture = TestBed.createComponent(AuthorityPage);
    fixture.componentRef.setInput('id', id);
    page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function text(testId: string): string | undefined {
    return page.querySelector(`[data-testid="${testId}"]`)?.textContent?.replace(/\s+/g, ' ').trim();
  }

  function type(field: string, value: string): void {
    const input = page.querySelector<HTMLInputElement>(`input[name="${field}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function openAndSubmit(name: string, shortName = '', citation = ''): Promise<void> {
    page.querySelector<HTMLButtonElement>('[data-testid="add"]')!.click();
    await settle();
    type('name', name);
    type('shortName', shortName);
    type('citation', citation);
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
  }

  function dialog(testId: string): HTMLDialogElement {
    return page.querySelector<HTMLDialogElement>(`[data-testid="${testId}"]`)!;
  }

  async function askToDelete(framework: DashboardFramework): Promise<void> {
    page.querySelector<HTMLButtonElement>(`[data-testid="delete-${framework.id.slice(0, 8)}"]`)!.click();
    await settle();
  }

  async function confirmDelete(): Promise<void> {
    page.querySelector<HTMLButtonElement>('[data-testid="confirm-framework-delete"]')!.click();
    await settle();
  }

  beforeAll(() => polyfillDialog());

  beforeEach(() => {
    get = vi.fn<() => Observable<Dashboard>>(() => dashboardOf(eba));
    create = vi.fn<(request: CreateFrameworkRequest) => Observable<void>>(() => of(undefined));
    remove = vi.fn<(id: string) => Observable<void>>(() => of(undefined));
    show = vi.fn<(text: string) => void>();
    TestBed.configureTestingModule({
      imports: [AuthorityPage],
      providers: [
        provideRouter([]),
        { provide: DashboardApi, useValue: { get } },
        { provide: FrameworkApi, useValue: { create, delete: remove } },
        { provide: Notifications, useValue: { show } },
      ],
    });
  });

  it('shows the breadcrumb through the hierarchy and the authority name', async () => {
    await render();

    const links = Array.from(page.querySelectorAll<HTMLAnchorElement>('.crumbs a'));
    expect(links.map((link) => [link.textContent?.trim(), link.getAttribute('href')])).toEqual([
      ['Regulatory data', '/authorities'],
      ['Authorities', '/authorities'],
    ]);
    expect(text('crumb-current')).toBe('European Banking Authority');
    expect(page.querySelector('h1')?.textContent?.trim()).toBe('European Banking Authority');
  });

  it('shows the summary: jurisdiction, status, created and the number of frameworks', async () => {
    await render();

    const items = Array.from(page.querySelectorAll('.summary > div')).map((item) => [
      item.querySelector('dt')?.textContent?.trim(),
      item.querySelector('dd')?.textContent?.replace(/\s+/g, ' ').trim(),
    ]);
    expect(items).toEqual([
      ['Jurisdiction', 'EU'],
      ['Status', 'Enabled'],
      ['Created', '01 Oct 2026 · admin-console'],
      ['Frameworks', '2'],
    ]);
    expect(page.querySelector('.summary .pill')?.classList).toContain('on');
  });

  it('shows a disabled authority', async () => {
    get.mockReturnValue(dashboardOf({ ...eba, enabled: false }));
    await render();

    expect(page.querySelector('.summary .pill')?.textContent?.trim()).toBe('Disabled');
    expect(page.querySelector('.summary .pill')?.classList).toContain('off');
  });

  it('lists the frameworks of the authority with their coverage', async () => {
    await render();

    expect(text('count')).toBe('2 frameworks');
    expect(Array.from(page.querySelectorAll('tbody .name')).map((cell) => cell.textContent?.trim())).toEqual([
      'Digital Operational Resilience Act',
      'Markets in Crypto-Assets',
    ]);
    expect(page.querySelector('tbody [data-testid="coverage"] b')?.textContent?.replace(/\s+/g, ' ').trim()).toBe('33% 1/3');
  });

  it('uses the singular for one framework', async () => {
    get.mockReturnValue(dashboardOf({ ...eba, frameworks: [dora] }));
    await render();

    expect(text('count')).toBe('1 framework');
  });

  it('shows a friendly message for an unknown authority', async () => {
    await render('00000000-0000-4000-8000-000000000000');

    expect(text('not-found')).toContain('Authority not found');
    expect(page.querySelector('[data-testid="not-found"] a')?.getAttribute('href')).toBe('/authorities');
    expect(text('crumb-current')).toBe('Authority');
    expect(page.querySelector('[data-testid="summary"]')).toBeNull();
  });

  it('shows a loading message until the dashboard arrives', async () => {
    get.mockReturnValue(new Subject<Dashboard>());
    await render();

    expect(text('loading')).toBe('Loading the authority…');
    expect(page.querySelector('[data-testid="not-found"]')).toBeNull();
  });

  it('shows a message when the dashboard cannot be loaded', async () => {
    get.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();

    expect(text('load-error')).toBe('The authority could not be loaded. Try again later.');
    expect(page.querySelector('[data-testid="not-found"]')).toBeNull();
  });

  it('opens the create dialog from the + button and names the authority', async () => {
    await render();
    expect(dialog('create-dialog').open).toBe(false);

    page.querySelector<HTMLButtonElement>('[data-testid="add"]')!.click();
    await settle();

    expect(dialog('create-dialog').open).toBe(true);
    expect(dialog('create-dialog').textContent).toContain('Issued by European Banking Authority.');
    expect(document.activeElement).toBe(page.querySelector('#framework-name'));
  });

  it('creates the framework for this authority, closes the dialog, confirms and reloads', async () => {
    await render();
    const esma = { ...mica, id: '9c8d7e6f-0000-4000-8000-000000000003', name: 'Single Rulebook' };
    get.mockReturnValue(dashboardOf({ ...eba, frameworks: [dora, mica, esma] }));

    await openAndSubmit('Single Rulebook', 'SRB', 'CRR');

    expect(create).toHaveBeenCalledWith({ authorityId: eba.id, name: 'Single Rulebook', shortName: 'SRB', citation: 'CRR' });
    expect(dialog('create-dialog').open).toBe(false);
    expect(show).toHaveBeenCalledWith('Framework created');
    expect(get).toHaveBeenCalledTimes(2);
    expect(text('count')).toBe('3 frameworks');
  });

  it('keeps the dialog open and shows the server message for a duplicate name', async () => {
    const detail = `A framework named 'DORA' already exists for authority ${eba.id}`;
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { detail } })));
    await render();

    await openAndSubmit('DORA');

    expect(dialog('create-dialog').open).toBe(true);
    expect(text('create-error')).toBe(detail);
    expect(show).not.toHaveBeenCalled();
  });

  it('falls back to a default message for a duplicate without detail', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: {} })));
    await render();

    await openAndSubmit('DORA');

    expect(text('create-error')).toBe('This authority already has a framework with this name.');
  });

  it('shows the field errors the server returns', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { errors: { name: 'must not be blank' } } })));
    await render();

    await openAndSubmit('DORA');

    expect(text('name-error')).toBe('must not be blank');
    expect(text('create-error')).toBe('Check the highlighted fields.');
  });

  it('explains when the authority no longer exists and reloads', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    await render();

    await openAndSubmit('DORA');

    expect(text('create-error')).toBe('This authority no longer exists.');
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('explains other create failures', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();

    await openAndSubmit('DORA');

    expect(text('create-error')).toBe('The framework could not be created. Try again later.');
  });

  it('closes the create dialog on cancel and clears earlier errors when reopened', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();
    await openAndSubmit('DORA');

    page.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!.click();
    await settle();
    expect(dialog('create-dialog').open).toBe(false);

    page.querySelector<HTMLButtonElement>('[data-testid="add"]')!.click();
    await settle();
    expect(page.querySelector('[data-testid="create-error"]')).toBeNull();
    expect(page.querySelector<HTMLInputElement>('#framework-name')!.value).toBe('');
  });

  it('asks for confirmation before deleting a framework without files', async () => {
    await render();

    await askToDelete(mica);

    expect(dialog('delete-dialog').open).toBe(true);
    expect(text('framework-delete-text')).toContain('Markets in Crypto-Assets will be removed from the regulatory database');
    expect(remove).not.toHaveBeenCalled();
  });

  it('deletes the framework, closes the dialog, confirms and reloads', async () => {
    await render();
    get.mockReturnValue(dashboardOf({ ...eba, frameworks: [dora] }));
    await askToDelete(mica);

    await confirmDelete();

    expect(remove).toHaveBeenCalledWith(mica.id);
    expect(dialog('delete-dialog').open).toBe(false);
    expect(show).toHaveBeenCalledWith('Framework deleted');
    expect(get).toHaveBeenCalledTimes(2);
    expect(text('count')).toBe('1 framework');
  });

  it('explains before deleting that a framework with files cannot be deleted yet', async () => {
    await render();

    await askToDelete(dora);

    expect(dialog('delete-dialog').open).toBe(true);
    expect(text('framework-delete-blocked')).toBe('It has 1 file. Delete it first, then delete this framework.');
    expect(page.querySelector('[data-testid="confirm-framework-delete"]')).toBeNull();
  });

  it('shows the server message and reloads when the server says the framework still has files', async () => {
    const detail = `Framework ${mica.id} has files. Delete them first.`;
    remove.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { detail } })));
    await render();
    get.mockReturnValue(dashboardOf({ ...eba, frameworks: [dora, { ...mica, files: [file] }] }));
    await askToDelete(mica);

    await confirmDelete();

    expect(dialog('delete-dialog').open).toBe(true);
    expect(text('framework-delete-error')).toBe(detail);
    expect(get).toHaveBeenCalledTimes(2);
    expect(text('framework-delete-blocked')).toBe('It has 1 file. Delete it first, then delete this framework.');
    expect(page.querySelector('[data-testid="confirm-framework-delete"]')).toBeNull();
  });

  it('falls back to a default message for a 409 without detail', async () => {
    remove.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: {} })));
    await render();
    await askToDelete(mica);

    await confirmDelete();

    expect(text('framework-delete-error')).toBe('This framework has files. Delete them first.');
  });

  it('refreshes and explains when the framework no longer exists', async () => {
    remove.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    await render();
    await askToDelete(mica);

    await confirmDelete();

    expect(text('framework-delete-error')).toBe('This framework no longer exists. The list has been refreshed.');
    expect(get).toHaveBeenCalledTimes(2);
    expect(show).not.toHaveBeenCalled();
  });

  it('explains other delete failures and keeps the dialog open', async () => {
    remove.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();
    await askToDelete(mica);

    await confirmDelete();

    expect(dialog('delete-dialog').open).toBe(true);
    expect(text('framework-delete-error')).toBe('The framework could not be deleted. Try again later.');
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('closes the delete dialog on cancel without deleting and clears the error next time', async () => {
    remove.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();
    await askToDelete(mica);
    await confirmDelete();

    page.querySelector<HTMLButtonElement>('[data-testid="cancel-framework-delete"]')!.click();
    await settle();
    expect(dialog('delete-dialog').open).toBe(false);

    await askToDelete(mica);
    expect(page.querySelector('[data-testid="framework-delete-error"]')).toBeNull();
    expect(remove).toHaveBeenCalledTimes(1);
  });
});
