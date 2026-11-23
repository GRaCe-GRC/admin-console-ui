import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CreateFrameworkRequest } from '../models/framework';
import { FrameworkApi } from './framework-api';

describe('FrameworkApi', () => {
  let api: FrameworkApi;
  let http: HttpTestingController;

  const id = '7a6b5c4d-0000-4000-8000-000000000001';
  const request: CreateFrameworkRequest = {
    authorityId: '3f2c1a9e-7d4b-4e8a-9c1f-2b6d5e8a7c40',
    name: 'Digital Operational Resilience Act',
    shortName: 'DORA',
    citation: 'Regulation (EU) 2022/2554',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(FrameworkApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the new framework and completes on 201 with an empty body', () => {
    let completed = false;
    api.create(request).subscribe({ complete: () => (completed = true) });

    const call = http.expectOne('/api/dashboard/frameworks');
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);
    call.flush(null, { status: 201, statusText: 'Created' });

    expect(completed).toBe(true);
  });

  it('passes a duplicate name to the caller', () => {
    let status: number | undefined;
    api.create(request).subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne('/api/dashboard/frameworks')
      .flush({ status: 409, detail: 'A framework named DORA already exists' }, { status: 409, statusText: 'Conflict' });

    expect(status).toBe(409);
  });

  it('deletes the framework and completes on 204', () => {
    let completed = false;
    api.delete(id).subscribe({ complete: () => (completed = true) });

    const call = http.expectOne(`/api/dashboard/frameworks/${id}`);
    expect(call.request.method).toBe('DELETE');
    call.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });

  it('passes a framework that still has files to the caller', () => {
    let status: number | undefined;
    api.delete(id).subscribe({ error: (error) => (status = error.status) });

    http
      .expectOne(`/api/dashboard/frameworks/${id}`)
      .flush({ status: 409, detail: `Framework ${id} has files. Delete them first.` }, { status: 409, statusText: 'Conflict' });

    expect(status).toBe(409);
  });
});
