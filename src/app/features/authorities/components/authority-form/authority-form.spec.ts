import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateAuthorityRequest } from '../../models/authority';
import { AuthorityForm } from './authority-form';

describe('AuthorityForm', () => {
  let fixture: ComponentFixture<AuthorityForm>;
  let element: HTMLElement;
  let created: CreateAuthorityRequest[];
  let cancelled: number;

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityForm);
    element = fixture.nativeElement as HTMLElement;
    created = [];
    cancelled = 0;
    fixture.componentInstance.create.subscribe((request) => created.push(request));
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    fixture.detectChanges();
  });

  function type(field: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(`input[name="${field}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function text(testId: string): string | undefined {
    return element.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
  }

  it('says who creates the authority', () => {
    expect(element.querySelector('#create-title')?.textContent?.trim()).toBe('New authority');
    expect(element.textContent).toContain('It is created enabled, by Compliance Expert.');
  });

  it('emits the request when both fields are filled in', () => {
    type('name', 'European Banking Authority');
    type('jurisdiction', 'EU');
    submit();

    expect(created).toEqual([{ name: 'European Banking Authority', jurisdiction: 'EU' }]);
  });

  it('explains which fields are missing and does not emit', () => {
    submit();

    expect(text('name-error')).toBe("Enter the authority's name.");
    expect(text('jurisdiction-error')).toBe('Enter the jurisdiction, for example EU or UK.');
    expect(element.querySelector('#authority-name')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#authority-name')?.getAttribute('aria-describedby')).toBe('authority-name-error');
    expect(element.querySelector('.field.invalid')).not.toBeNull();
    expect(created).toEqual([]);
  });

  it('rejects values longer than 255 characters', () => {
    type('name', 'x'.repeat(256));
    type('jurisdiction', 'EU');
    submit();

    expect(text('name-error')).toBe('Use at most 255 characters.');
    expect(created).toEqual([]);
  });

  it('shows the server field errors and the form error', () => {
    fixture.componentRef.setInput('serverErrors', { name: 'must not be blank' });
    fixture.componentRef.setInput('formError', 'Check the highlighted fields.');
    fixture.detectChanges();

    expect(text('name-error')).toBe('must not be blank');
    expect(text('create-error')).toBe('Check the highlighted fields.');
  });

  it('disables the submit button while submitting', () => {
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    expect(element.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
  });

  it('emits cancelled from Cancel and from the close button', () => {
    element.querySelector<HTMLButtonElement>('[data-testid="cancel"]')!.click();
    element.querySelector<HTMLButtonElement>('[data-testid="close"]')!.click();

    expect(cancelled).toBe(2);
  });

  it('clears the fields on reset and focuses the name on focus', () => {
    type('name', 'European Banking Authority');
    fixture.componentInstance.reset();
    fixture.componentInstance.focus();
    fixture.detectChanges();

    const name = element.querySelector<HTMLInputElement>('#authority-name')!;
    expect(name.value).toBe('');
    expect(document.activeElement).toBe(name);
  });
});
