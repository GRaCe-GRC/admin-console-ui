import { HttpErrorResponse } from '@angular/common/http';
import { detailOf, fieldErrorsOf, problemDetailOf } from './problem-detail';

describe('problem-detail', () => {
  it('reads the problem detail from the error body', () => {
    const error = new HttpErrorResponse({ status: 409, error: { status: 409, detail: 'Duplicate' } });

    expect(problemDetailOf(error)).toEqual({ status: 409, detail: 'Duplicate' });
    expect(detailOf(error)).toBe('Duplicate');
  });

  it('returns an empty problem detail when the body is not an object', () => {
    const error = new HttpErrorResponse({ status: 502, error: 'Bad Gateway' });

    expect(problemDetailOf(error)).toEqual({});
    expect(detailOf(error)).toBeNull();
    expect(fieldErrorsOf(error)).toBeNull();
  });

  it('returns an empty problem detail when there is no body', () => {
    expect(problemDetailOf(new HttpErrorResponse({ status: 500 }))).toEqual({});
  });

  it('returns the field errors of a 400', () => {
    const error = new HttpErrorResponse({ status: 400, error: { errors: { name: 'must not be blank' } } });

    expect(fieldErrorsOf(error)).toEqual({ name: 'must not be blank' });
  });

  it('ignores field errors on other statuses', () => {
    const error = new HttpErrorResponse({ status: 409, error: { errors: { name: 'taken' } } });

    expect(fieldErrorsOf(error)).toBeNull();
  });
});
