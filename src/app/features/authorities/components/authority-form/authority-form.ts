import { Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateAuthorityRequest } from '../../models/authority';

type AuthorityField = 'name' | 'jurisdiction';

@Component({
  selector: 'app-authority-form',
  imports: [ReactiveFormsModule],
  templateUrl: './authority-form.html',
  styleUrl: './authority-form.scss',
})
export class AuthorityForm {
  readonly submitting = input(false);
  readonly serverErrors = input<Record<string, string> | null>(null);
  readonly formError = input<string | null>(null);
  readonly create = output<CreateAuthorityRequest>();

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(255)] }),
    jurisdiction: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
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

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.create.emit(this.form.getRawValue());
  }

  protected fieldError(field: AuthorityField): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) {
      return null;
    }
    if (control.errors['server']) {
      return control.errors['server'];
    }
    if (control.errors['required']) {
      return 'Required';
    }
    if (control.errors['maxlength']) {
      return 'At most 255 characters';
    }
    return null;
  }
}
