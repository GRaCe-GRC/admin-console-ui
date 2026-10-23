import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { detailOf, fieldErrorsOf } from '../../../../core/http/problem-detail';
import { AuthorityForm } from '../../components/authority-form/authority-form';
import { AuthorityTable } from '../../components/authority-table/authority-table';
import { AuthorityApi } from '../../data-access/authority-api';
import { Authority, CreateAuthorityRequest } from '../../models/authority';

@Component({
  selector: 'app-authorities-dashboard',
  imports: [AuthorityForm, AuthorityTable],
  templateUrl: './authorities-dashboard.html',
  styleUrl: './authorities-dashboard.scss',
})
export class AuthoritiesDashboard implements OnInit {
  private readonly api = inject(AuthorityApi);
  private readonly authorityForm = viewChild.required(AuthorityForm);

  protected readonly authorities = signal<Authority[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string> | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.findAll().subscribe({
      next: (authorities) => {
        this.authorities.set(authorities);
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set('The authorities could not be loaded. Try again later.');
        this.loading.set(false);
      },
    });
  }

  protected create(request: CreateAuthorityRequest): void {
    this.submitting.set(true);
    this.createError.set(null);
    this.serverErrors.set(null);
    this.api.create(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.authorityForm().reset();
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.showServerError(error);
      },
    });
  }

  private showServerError(error: HttpErrorResponse): void {
    const fieldErrors = fieldErrorsOf(error);
    if (fieldErrors) {
      this.serverErrors.set(fieldErrors);
      this.createError.set('Check the highlighted fields.');
    } else if (error.status === 409) {
      this.createError.set(detailOf(error) ?? 'An authority with this name already exists.');
    } else {
      this.createError.set('The authority could not be created. Try again later.');
    }
  }
}
