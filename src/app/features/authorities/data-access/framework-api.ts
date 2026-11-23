import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CreateFrameworkRequest } from '../models/framework';

@Injectable({ providedIn: 'root' })
export class FrameworkApi {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/dashboard/frameworks';

  create(request: CreateFrameworkRequest): Observable<void> {
    return this.http.post(this.url, request, { observe: 'response' }).pipe(map(() => undefined));
  }

  delete(id: string): Observable<void> {
    return this.http.delete(`${this.url}/${encodeURIComponent(id)}`, { observe: 'response' }).pipe(map(() => undefined));
  }
}
