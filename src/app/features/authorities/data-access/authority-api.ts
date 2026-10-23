import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Authority, CreateAuthorityRequest } from '../models/authority';

@Injectable({ providedIn: 'root' })
export class AuthorityApi {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/dashboard/authorities';

  findAll(): Observable<Authority[]> {
    return this.http.get<Authority[]>(this.url);
  }

  create(request: CreateAuthorityRequest): Observable<void> {
    return this.http.post(this.url, request, { observe: 'response' }).pipe(map(() => undefined));
  }
}
