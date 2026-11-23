import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateFrameworkRequest } from '../../models/framework';

type FrameworkField = 'name' | 'shortName' | 'citation';

@Component({
  selector: 'app-framework-form',
  imports: [ReactiveFormsModule],
  templateUrl: './framework-form.html',
  styleUrl: './framework-form.scss',
})
export class FrameworkForm {
  readonly authorityName = input('');
  readonly submitting = input(false);
  readonly serverErrors = input<Record<string, string> | null>(null);
  readonly formError = input<string | null>(null);
  readonly create = output<Omit<CreateFrameworkRequest, 'authorityId'>>();
  readonly cancelled = output<void>();

  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    shortName: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
    citation: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(255)] }),
  });

  constructor() {
    effect(() => {
      for (const [field, message] of Object.entries(this.serverErrors() ?? {})) {
        const control = this.form.get(field);
        control?.setErrors({ server: message });
        control?.markAsTouched();
      }
    });
  }

  reset(): void {
    this.form.reset();
  }

  focus(): void {
    this.nameInput().nativeElement.focus();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, shortName, citation } = this.form.getRawValue();
    this.create.emit({ name: name.trim(), shortName: shortName.trim() || null, citation: citation.trim() || null });
  }

  protected fieldError(field: FrameworkField): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['server']) {
      return control.errors['server'];
    }
    if (control.errors['required']) {
      return "Enter the framework's name.";
    }
    if (control.errors['maxlength']) {
      return 'Use at most 255 characters.';
    }
    return null;
  }
}
