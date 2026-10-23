import { Component, ElementRef, effect, input, output, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CURRENT_USER } from '../../../../core/auth/current-user';
import { CreateAuthorityRequest } from '../../models/authority';

type AuthorityField = 'name' | 'jurisdiction';

const REQUIRED_MESSAGES: Record<AuthorityField, string> = {
  name: "Enter the authority's name.",
  jurisdiction: 'Enter the jurisdiction, for example EU or UK.',
};

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
  readonly cancelled = output<void>();

  protected readonly userName = CURRENT_USER.name;
  private readonly nameInput = viewChild.required<ElementRef<HTMLInputElement>>('nameInput');

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

  focus(): void {
    this.nameInput().nativeElement.focus();
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
      return REQUIRED_MESSAGES[field];
    }
    if (control.errors['maxlength']) {
      return 'Use at most 255 characters.';
    }
    return null;
  }
}
