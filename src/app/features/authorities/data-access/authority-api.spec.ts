import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthorityApi } from './authority-api';

describe('AuthorityApi', () => {
  let api: AuthorityApi;
  let http: HttpTestingController;

  const id = '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AuthorityApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the new authority and completes on 201 with an empty body', () => {
    let completed = false;
    api.create({ name: 'EBA', jurisdiction: 'EU' }).subscribe({ complete: () => (completed = true) });

    const request = http.expectOne('/api/dashboard/authorities');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ name: 'EBA', jurisdiction: 'EU' });
    request.flush(null, { status: 201, statusText: 'Created' });

    expect(completed).toBe(true);
  });

  it('deletes the authority and completes on 204', () => {
    let completed = false;
    api.delete(id).subscribe({ complete: () => (completed = true) });

    const request = http.expectOne(`/api/dashboard/authorities/${id}`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });

  it('passes a not-found delete to the caller', () => {
    let status: number | undefined;
    api.delete(id).subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`/api/dashboard/authorities/${id}`)
      .flush({ status: 404, detail: `Authority ${id} not found` }, { status: 404, statusText: 'Not Found' });

    expect(status).toBe(404);
  });

  it('passes errors to the caller', () => {
    let status: number | undefined;
    api.create({ name: 'EBA', jurisdiction: 'EU' }).subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne('/api/dashboard/authorities')
      .flush({ status: 409, detail: 'An authority named EBA already exists' }, { status: 409, statusText: 'Conflict' });

    expect(status).toBe(409);
  });
});
