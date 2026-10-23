import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { polyfillDialog } from '../../../../../testing/dialog';
import { Notifications } from '../../../../core/notifications/notifications';
import { AuthorityApi } from '../../data-access/authority-api';
import { Authority, CreateAuthorityRequest } from '../../models/authority';
import { AuthoritiesDashboard } from './authorities-dashboard';

describe('AuthoritiesDashboard', () => {
  const eba: Authority = {
    id: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'European Banking Authority',
    jurisdiction: 'EU',
    createdAt: '2026-10-01T10:15:30Z',
    enabled: true,
    createdBy: 'admin-console',
  };
  const fca: Authority = { ...eba, id: '9b1d2c3e-0000-4000-8000-000000000001', name: 'FCA', jurisdiction: 'UK', enabled: false };

  let findAll: ReturnType<typeof vi.fn<() => Observable<Authority[]>>>;
  let create: ReturnType<typeof vi.fn<(request: CreateAuthorityRequest) => Observable<void>>>;
  let show: ReturnType<typeof vi.fn<(text: string) => void>>;
  let fixture: ComponentFixture<AuthoritiesDashboard>;
  let page: HTMLElement;

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(AuthoritiesDashboard);
    page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function settle(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function type(field: string, value: string): void {
    const input = page.querySelector<HTMLInputElement>(`input[name="${field}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function openAndSubmit(name: string, jurisdiction: string): Promise<void> {
    page.querySelector<HTMLButtonElement>('[data-testid="add"]')!.click();
    await settle();
    type('name', name);
    type('jurisdiction', jurisdiction);
    page.querySelector('form')!.dispatchEvent(new Event('submit'));
    await settle();
  }

  function text(testId: string): string | undefined {
    return page.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
  }

  function dialog(): HTMLDialogElement {
    return page.querySelector<HTMLDialogElement>('[data-testid="create-dialog"]')!;
  }

  beforeAll(() => polyfillDialog());

  beforeEach(() => {
    findAll = vi.fn<() => Observable<Authority[]>>(() => of([eba, fca]));
    create = vi.fn<(request: CreateAuthorityRequest) => Observable<void>>(() => of(undefined));
    show = vi.fn<(text: string) => void>();
    TestBed.configureTestingModule({
      imports: [AuthoritiesDashboard],
      providers: [
        { provide: AuthorityApi, useValue: { findAll, create } },
        { provide: Notifications, useValue: { show } },
      ],
    });
  });

  it('shows the page title, breadcrumb and the authorities in the table', async () => {
    await render();

    expect(page.querySelector('h1')?.textContent?.trim()).toBe('Regulatory authorities');
    expect(page.querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Authorities');
    expect(Array.from(page.querySelectorAll('tbody .name')).map((cell) => cell.textContent?.trim())).toEqual([
      'European Banking Authority',
      'FCA',
    ]);
  });

  it('shows how many authorities there are and how many are enabled', async () => {
    await render();

    expect(text('count')).toBe('2 authorities');
    expect(text('enabled-count')).toBe('1 enabled');
  });

  it('uses the singular for one authority', async () => {
    findAll.mockReturnValue(of([eba]));
    await render();

    expect(text('count')).toBe('1 authority');
  });

  it('keeps the create dialog closed until the + button is pressed', async () => {
    await render();
    expect(dialog().open).toBe(false);

    page.querySelector<HTMLButtonElement>('[data-testid="add"]')!.click();
    await settle();

    expect(dialog().open).toBe(true);
    expect(document.activeElement).toBe(page.querySelector('#authority-name'));
  });

  it('creates the authority, closes the dialog, confirms and reloads the list', async () => {
    await render();
    findAll.mockReturnValue(of([eba, fca, { ...eba, id: 'new', name: 'ESMA' }]));

    await openAndSubmit('ESMA', 'EU');

    expect(create).toHaveBeenCalledWith({ name: 'ESMA', jurisdiction: 'EU' });
    expect(dialog().open).toBe(false);
    expect(show).toHaveBeenCalledWith('Authority created');
    expect(findAll).toHaveBeenCalledTimes(2);
    expect(text('count')).toBe('3 authorities');
  });

  it('keeps the dialog open and shows the server message for a duplicate name', async () => {
    create.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { detail: "An authority named 'EBA' already exists" } })),
    );
    await render();

    await openAndSubmit('EBA', 'EU');

    expect(dialog().open).toBe(true);
    expect(text('create-error')).toBe("An authority named 'EBA' already exists");
    expect(show).not.toHaveBeenCalled();
  });

  it('falls back to a default message for a duplicate without detail', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: {} })));
    await render();

    await openAndSubmit('EBA', 'EU');

    expect(text('create-error')).toBe('An authority with this name already exists.');
  });

  it('shows the field errors the server returns', async () => {
    create.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 400, error: { errors: { jurisdiction: 'must not be blank' } } })),
    );
    await render();

    await openAndSubmit('EBA', 'EU');

    expect(text('jurisdiction-error')).toBe('must not be blank');
    expect(text('create-error')).toBe('Check the highlighted fields.');
  });

  it('explains other create failures', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();

    await openAndSubmit('EBA', 'EU');

    expect(text('create-error')).toBe('The authority could not be created. Try again later.');
  });

  it('closes the dialog on cancel and clears earlier errors when reopened', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();
    await openAndSubmit('EBA', 'EU');

    page.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!.click();
    await settle();
    expect(dialog().open).toBe(false);

    page.querySelector<HTMLButtonElement>('[data-testid="add"]')!.click();
    await settle();
    expect(page.querySelector('[data-testid="create-error"]')).toBeNull();
    expect(page.querySelector<HTMLInputElement>('#authority-name')!.value).toBe('');
  });

  it('shows a message when the list cannot be loaded', async () => {
    findAll.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();

    expect(text('load-error')).toBe('The authorities could not be loaded. Try again later.');
  });
});
