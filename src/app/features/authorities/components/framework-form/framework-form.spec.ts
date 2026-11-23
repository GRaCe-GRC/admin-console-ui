import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateFrameworkRequest } from '../../models/framework';
import { FrameworkForm } from './framework-form';

describe('FrameworkForm', () => {
  let fixture: ComponentFixture<FrameworkForm>;
  let element: HTMLElement;
  let created: Omit<CreateFrameworkRequest, 'authorityId'>[];
  let cancelled: number;

  beforeEach(() => {
    fixture = TestBed.createComponent(FrameworkForm);
    element = fixture.nativeElement as HTMLElement;
    created = [];
    cancelled = 0;
    fixture.componentInstance.create.subscribe((request) => created.push(request));
    fixture.componentInstance.cancelled.subscribe(() => cancelled++);
    fixture.componentRef.setInput('authorityName', 'European Banking Authority');
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

  it('says which authority issues the framework', () => {
    expect(element.querySelector('#framework-create-title')?.textContent?.trim()).toBe('New framework');
    expect(element.textContent).toContain('Issued by European Banking Authority.');
  });

  it('emits the trimmed request when every field is filled in', () => {
    type('name', ' Digital Operational Resilience Act ');
    type('shortName', 'DORA');
    type('citation', 'Regulation (EU) 2022/2554');
    submit();

    expect(created).toEqual([{ name: 'Digital Operational Resilience Act', shortName: 'DORA', citation: 'Regulation (EU) 2022/2554' }]);
  });

  it('sends null for an empty short name and citation', () => {
    type('name', 'Digital Operational Resilience Act');
    type('shortName', '  ');
    submit();

    expect(created).toEqual([{ name: 'Digital Operational Resilience Act', shortName: null, citation: null }]);
  });

  it('asks for the name and does not emit without it', () => {
    submit();

    expect(text('name-error')).toBe("Enter the framework's name.");
    expect(element.querySelector('#framework-name')?.getAttribute('aria-invalid')).toBe('true');
    expect(element.querySelector('#framework-name')?.getAttribute('aria-describedby')).toBe('framework-name-error');
    expect(element.querySelector('[data-testid="shortName-error"]')).toBeNull();
    expect(created).toEqual([]);
  });

  it('rejects values longer than 255 characters', () => {
    type('name', 'DORA');
    type('citation', 'x'.repeat(256));
    submit();

    expect(text('citation-error')).toBe('Use at most 255 characters.');
    expect(created).toEqual([]);
  });

  it('shows the server field errors and the form error', () => {
    fixture.componentRef.setInput('serverErrors', { shortName: 'size must be between 0 and 255' });
    fixture.componentRef.setInput('formError', 'Check the highlighted fields.');
    fixture.detectChanges();

    expect(text('shortName-error')).toBe('size must be between 0 and 255');
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
    type('name', 'DORA');
    fixture.componentInstance.reset();
    fixture.componentInstance.focus();
    fixture.detectChanges();

    const name = element.querySelector<HTMLInputElement>('#framework-name')!;
    expect(name.value).toBe('');
    expect(document.activeElement).toBe(name);
  });
});
