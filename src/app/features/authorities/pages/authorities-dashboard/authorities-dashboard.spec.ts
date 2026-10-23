import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
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
  let fixture: ComponentFixture<AuthoritiesDashboard>;
  let page: HTMLElement;

  async function render(): Promise<void> {
    fixture = TestBed.createComponent(AuthoritiesDashboard);
    page = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function type(field: string, value: string): void {
    const input = page.querySelector<HTMLInputElement>(`input[name="${field}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function submit(): Promise<void> {
    page.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function text(selector: string): string | undefined {
    return page.querySelector(selector)?.textContent?.trim();
  }

  beforeEach(() => {
    findAll = vi.fn<() => Observable<Authority[]>>(() => of([eba, fca]));
    create = vi.fn<(request: CreateAuthorityRequest) => Observable<void>>(() => of(undefined));
    TestBed.configureTestingModule({
      imports: [AuthoritiesDashboard],
      providers: [{ provide: AuthorityApi, useValue: { findAll, create } }],
    });
  });

  it('shows the authorities in the table', async () => {
    await render();

    const rows = Array.from(page.querySelectorAll('tbody tr')).map((row) =>
      Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim()),
    );
    expect(rows).toHaveLength(2);
    expect(rows[0][0]).toBe('European Banking Authority');
    expect(rows[0][1]).toBe('EU');
    expect(rows[0][2]).toBe('Yes');
    expect(rows[0][3]).toContain('2026');
    expect(rows[0][4]).toBe('admin-console');
    expect(rows[1][2]).toBe('No');
  });

  it('shows a message when there are no authorities', async () => {
    findAll.mockReturnValue(of([]));

    await render();

    expect(text('[data-testid="empty"]')).toBe('No authorities yet.');
  });

  it('shows an error when the authorities cannot be loaded', async () => {
    findAll.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));

    await render();

    expect(text('[data-testid="load-error"]')).toBe('The authorities could not be loaded. Try again later.');
    expect(page.querySelector('table')).toBeNull();
  });

  it('requires a name and a jurisdiction', async () => {
    await render();

    await submit();

    expect(text('[data-testid="name-error"]')).toBe('Required');
    expect(text('[data-testid="jurisdiction-error"]')).toBe('Required');
    expect(create).not.toHaveBeenCalled();
  });

  it('limits the fields to 255 characters', async () => {
    await render();
    type('name', 'x'.repeat(256));
    type('jurisdiction', 'EU');

    await submit();

    expect(text('[data-testid="name-error"]')).toBe('At most 255 characters');
    expect(create).not.toHaveBeenCalled();
  });

  it('creates the authority, resets the form and reloads the list', async () => {
    await render();
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    await submit();

    expect(create).toHaveBeenCalledWith({ name: 'EBA', jurisdiction: 'EU' });
    expect(findAll).toHaveBeenCalledTimes(2);
    expect(page.querySelector<HTMLInputElement>('input[name="name"]')!.value).toBe('');
    expect(page.querySelector('[data-testid="create-error"]')).toBeNull();
  });

  it('shows the duplicate-name message from the server', async () => {
    create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { status: 409, detail: "An authority named 'EBA' already exists" },
          }),
      ),
    );
    await render();
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    await submit();

    expect(text('[data-testid="create-error"]')).toBe("An authority named 'EBA' already exists");
    expect(findAll).toHaveBeenCalledTimes(1);
  });

  it('shows a default duplicate-name message when the server sends no detail', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    await render();
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    await submit();

    expect(text('[data-testid="create-error"]')).toBe('An authority with this name already exists.');
  });

  it('shows the field errors from the server', async () => {
    create.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 400,
            error: { status: 400, errors: { jurisdiction: 'must not be blank' } },
          }),
      ),
    );
    await render();
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    await submit();

    expect(text('[data-testid="jurisdiction-error"]')).toBe('must not be blank');
    expect(text('[data-testid="create-error"]')).toBe('Check the highlighted fields.');
  });

  it('shows a generic message for other errors', async () => {
    create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 502 })));
    await render();
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    await submit();

    expect(text('[data-testid="create-error"]')).toBe('The authority could not be created. Try again later.');
  });
});
