import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { DashboardAuthority } from '../../../../core/dashboard/dashboard';
import { DashboardStore } from '../../../../core/dashboard/dashboard-store';
import { detailOf, fieldErrorsOf } from '../../../../core/http/problem-detail';
import { Notifications } from '../../../../core/notifications/notifications';
import { AuthorityDeleteDialog } from '../../components/authority-delete-dialog/authority-delete-dialog';
import { AuthorityForm } from '../../components/authority-form/authority-form';
import { AuthorityTable } from '../../components/authority-table/authority-table';
import { AuthorityApi } from '../../data-access/authority-api';
import { CreateAuthorityRequest } from '../../models/authority';

@Component({
  selector: 'app-authorities-dashboard',
  imports: [AuthorityDeleteDialog, AuthorityForm, AuthorityTable],
  templateUrl: './authorities-dashboard.html',
  styleUrl: './authorities-dashboard.scss',
})
export class AuthoritiesDashboard implements OnInit {
  private readonly api = inject(AuthorityApi);
  private readonly store = inject(DashboardStore);
  private readonly notifications = inject(Notifications);
  private readonly authorityForm = viewChild.required(AuthorityForm);
  private readonly createDialog = viewChild.required<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly deleteDialog = viewChild.required<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly authorities = this.store.authorities;
  protected readonly loading = computed(() => this.store.loading() && this.store.dashboard() === null);
  protected readonly loadError = computed(() => (this.store.loadFailed() ? 'The authorities could not be loaded. Try again later.' : null));
  protected readonly submitting = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string> | null>(null);
  protected readonly pendingDelete = signal<DashboardAuthority | null>(null);
  protected readonly deleteTarget = computed(() => {
    const pending = this.pendingDelete();
    return pending ? (this.authorities().find((authority) => authority.id === pending.id) ?? pending) : null;
  });
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly countLabel = computed(() => {
    const count = this.authorities().length;
    return `${count} ${count === 1 ? 'authority' : 'authorities'}`;
  });
  protected readonly enabledCount = computed(() => this.authorities().filter((authority) => authority.enabled).length);

  ngOnInit(): void {
    this.store.load();
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
        this.store.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.showServerError(error);
      },
    });
  }

  protected askToDelete(authority: DashboardAuthority): void {
    this.pendingDelete.set(authority);
    this.deleteError.set(null);
    this.deleteDialog().nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.deleteDialog().nativeElement.close();
  }

  protected delete(authority: DashboardAuthority): void {
    this.deleting.set(true);
    this.deleteError.set(null);
    this.api.delete(authority.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeDelete();
        this.pendingDelete.set(null);
        this.notifications.show('Authority deleted');
        this.store.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        if (error.status === 404) {
          this.deleteError.set('This authority no longer exists. The list has been refreshed.');
          this.store.reload();
        } else if (error.status === 409) {
          this.deleteError.set(detailOf(error) ?? 'This authority has frameworks. Delete them first.');
          this.store.reload();
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
