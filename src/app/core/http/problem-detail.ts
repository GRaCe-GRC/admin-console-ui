import { HttpErrorResponse } from '@angular/common/http';

export interface ProblemDetail {
  status?: number;
  title?: string;
  detail?: string;
  errors?: Record<string, string>;
}

export function problemDetailOf(error: HttpErrorResponse): ProblemDetail {
  const body: unknown = error.error;
  return body !== null && typeof body === 'object' ? (body as ProblemDetail) : {};
}

export function detailOf(error: HttpErrorResponse): string | null {
  return problemDetailOf(error).detail ?? null;
}

export function fieldErrorsOf(error: HttpErrorResponse): Record<string, string> | null {
  const errors = problemDetailOf(error).errors;
  return error.status === 400 && errors ? errors : null;
}
