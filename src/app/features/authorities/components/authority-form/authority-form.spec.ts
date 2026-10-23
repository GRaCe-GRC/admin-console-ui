import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateAuthorityRequest } from '../../models/authority';
import { AuthorityForm } from './authority-form';

describe('AuthorityForm', () => {
  let fixture: ComponentFixture<AuthorityForm>;
  let element: HTMLElement;
  let emitted: CreateAuthorityRequest[];

  function type(field: string, value: string): void {
    const input = element.querySelector<HTMLInputElement>(`input[name="${field}"]`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function submit(): void {
    element.querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  function text(selector: string): string | undefined {
    return element.querySelector(selector)?.textContent?.trim();
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthorityForm);
    element = fixture.nativeElement as HTMLElement;
    emitted = [];
    fixture.componentInstance.create.subscribe((request) => emitted.push(request));
    fixture.detectChanges();
  });

  it('emits the request when the form is valid', () => {
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    submit();

    expect(emitted).toEqual([{ name: 'EBA', jurisdiction: 'EU' }]);
  });

  it('requires a name and a jurisdiction and does not emit', () => {
    submit();

    expect(text('[data-testid="name-error"]')).toBe('Required');
    expect(text('[data-testid="jurisdiction-error"]')).toBe('Required');
    expect(emitted).toEqual([]);
  });

  it('limits the fields to 255 characters', () => {
    type('name', 'x'.repeat(256));
    type('jurisdiction', 'EU');

    submit();

    expect(text('[data-testid="name-error"]')).toBe('At most 255 characters');
    expect(emitted).toEqual([]);
  });

  it('shows no field errors before the user interacts', () => {
    expect(element.querySelector('[data-testid="name-error"]')).toBeNull();
  });

  it('shows the server field errors on their fields', () => {
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    fixture.componentRef.setInput('serverErrors', { jurisdiction: 'must not be blank' });
    fixture.detectChanges();

    expect(text('[data-testid="jurisdiction-error"]')).toBe('must not be blank');
    expect(element.querySelector('input[name="jurisdiction"]')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('[data-testid="name-error"]')).toBeNull();
  });

  it('shows the form error', () => {
    fixture.componentRef.setInput('formError', "An authority named 'EBA' already exists");
    fixture.detectChanges();

    expect(text('[data-testid="create-error"]')).toBe("An authority named 'EBA' already exists");
  });

  it('disables the button while submitting', () => {
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();

    expect(element.querySelector<HTMLButtonElement>('button')!.disabled).toBe(true);
  });

  it('clears the fields on reset', () => {
    type('name', 'EBA');
    type('jurisdiction', 'EU');

    fixture.componentInstance.reset();
    fixture.detectChanges();

    expect(element.querySelector<HTMLInputElement>('input[name="name"]')!.value).toBe('');
    expect(element.querySelector<HTMLInputElement>('input[name="jurisdiction"]')!.value).toBe('');
  });
});
