import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { detailOf, fieldErrorsOf } from '../../../../core/http/problem-detail';
import { Notifications } from '../../../../core/notifications/notifications';
import { AuthorityDeleteDialog } from '../../components/authority-delete-dialog/authority-delete-dialog';
import { AuthorityForm } from '../../components/authority-form/authority-form';
import { AuthorityTable } from '../../components/authority-table/authority-table';
import { AuthorityApi } from '../../data-access/authority-api';
import { Authority, CreateAuthorityRequest } from '../../models/authority';

@Component({
  selector: 'app-authorities-dashboard',
  imports: [AuthorityDeleteDialog, AuthorityForm, AuthorityTable],
  templateUrl: './authorities-dashboard.html',
  styleUrl: './authorities-dashboard.scss',
})
export class AuthoritiesDashboard implements OnInit {
  private readonly api = inject(AuthorityApi);
  private readonly notifications = inject(Notifications);
  private readonly authorityForm = viewChild.required(AuthorityForm);
  private readonly createDialog = viewChild.required<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly deleteDialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly authorities = signal<Authority[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string> | null>(null);
  protected readonly pendingDelete = signal<Authority | null>(null);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly countLabel = computed(() => {
    const count = this.authorities().length;
    return `${count} ${count === 1 ? 'authority' : 'authorities'}`;
  });
  protected readonly enabledCount = computed(() => this.authorities().filter((authority) => authority.enabled).length);

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

  protected openCreate(): void {
    this.clearCreateErrors();
    this.authorityForm().reset();
    this.createDialog().nativeElement.showModal();
    this.authorityForm().focus();
  }

  protected closeCreate(): void {
    this.createDialog().nativeElement.close();
  }

  protected create(request: CreateAuthorityRequest): void {
    this.submitting.set(true);
    this.clearCreateErrors();
    this.api.create(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCreate();
        this.authorityForm().reset();
        this.notifications.show('Authority created');
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.showServerError(error);
      },
    });
  }

  protected askToDelete(authority: Authority): void {
    this.pendingDelete.set(authority);
    this.deleteError.set(null);
    this.deleteDialog().nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.deleteDialog().nativeElement.close();
  }

  protected delete(authority: Authority): void {
    this.deleting.set(true);
    this.deleteError.set(null);
    this.api.delete(authority.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeDelete();
        this.pendingDelete.set(null);
        this.notifications.show('Authority deleted');
        this.load();
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        if (error.status === 404) {
          this.deleteError.set('This authority no longer exists. The list has been refreshed.');
          this.load();
        } else {
          this.deleteError.set('The authority could not be deleted. Try again later.');
        }
      },
    });
  }

  private clearCreateErrors(): void {
    this.createError.set(null);
    this.serverErrors.set(null);
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
