import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardFramework } from '../../../../core/dashboard/dashboard';
import { DashboardStore } from '../../../../core/dashboard/dashboard-store';
import { detailOf, fieldErrorsOf } from '../../../../core/http/problem-detail';
import { Notifications } from '../../../../core/notifications/notifications';
import { FrameworkDeleteDialog } from '../../components/framework-delete-dialog/framework-delete-dialog';
import { FrameworkForm } from '../../components/framework-form/framework-form';
import { FrameworkTable } from '../../components/framework-table/framework-table';
import { FrameworkApi } from '../../data-access/framework-api';
import { CreateFrameworkRequest } from '../../models/framework';

@Component({
  selector: 'app-authority-page',
  imports: [DatePipe, FrameworkDeleteDialog, FrameworkForm, FrameworkTable, RouterLink],
  templateUrl: './authority-page.html',
  styleUrl: './authority-page.scss',
})
export class AuthorityPage implements OnInit {
  private readonly api = inject(FrameworkApi);
  private readonly store = inject(DashboardStore);
  private readonly notifications = inject(Notifications);
  private readonly frameworkForm = viewChild(FrameworkForm);
  private readonly createDialog = viewChild<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly deleteDialog = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  readonly id = input.required<string>();

  protected readonly authority = computed(() => this.store.authorities().find((authority) => authority.id === this.id()) ?? null);
  protected readonly loading = computed(() => this.store.loading() && this.store.dashboard() === null);
  protected readonly loadError = computed(() => (this.store.loadFailed() ? 'The authority could not be loaded. Try again later.' : null));
  protected readonly notFound = computed(() => this.store.dashboard() !== null && this.authority() === null);
  protected readonly frameworks = computed(() => this.authority()?.frameworks ?? []);
  protected readonly countLabel = computed(() => {
    const count = this.frameworks().length;
    return `${count} ${count === 1 ? 'framework' : 'frameworks'}`;
  });

  protected readonly submitting = signal(false);
  protected readonly createError = signal<string | null>(null);
  protected readonly serverErrors = signal<Record<string, string> | null>(null);
  protected readonly pendingDelete = signal<DashboardFramework | null>(null);
  protected readonly deleteTarget = computed(() => {
    const pending = this.pendingDelete();
    return pending ? (this.frameworks().find((framework) => framework.id === pending.id) ?? pending) : null;
  });
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  ngOnInit(): void {
    this.store.load();
  }

  protected openCreate(): void {
    this.clearCreateErrors();
    this.frameworkForm()?.reset();
    this.createDialog()?.nativeElement.showModal();
    this.frameworkForm()?.focus();
  }

  protected closeCreate(): void {
    this.createDialog()?.nativeElement.close();
  }

  protected create(request: Omit<CreateFrameworkRequest, 'authorityId'>): void {
    this.submitting.set(true);
    this.clearCreateErrors();
    this.api.create({ authorityId: this.id(), ...request }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.closeCreate();
        this.frameworkForm()?.reset();
        this.notifications.show('Framework created');
        this.store.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.showServerError(error);
      },
    });
  }

  protected askToDelete(framework: DashboardFramework): void {
    this.pendingDelete.set(framework);
    this.deleteError.set(null);
    this.deleteDialog()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.deleteDialog()?.nativeElement.close();
  }

  protected delete(framework: DashboardFramework): void {
    this.deleting.set(true);
    this.deleteError.set(null);
    this.api.delete(framework.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.closeDelete();
        this.pendingDelete.set(null);
        this.notifications.show('Framework deleted');
        this.store.reload();
      },
      error: (error: HttpErrorResponse) => {
        this.deleting.set(false);
        if (error.status === 404) {
          this.deleteError.set('This framework no longer exists. The list has been refreshed.');
          this.store.reload();
        } else if (error.status === 409) {
          this.deleteError.set(detailOf(error) ?? 'This framework has files. Delete them first.');
          this.store.reload();
        } else {
          this.deleteError.set('The framework could not be deleted. Try again later.');
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
    } else if (error.status === 404) {
      this.createError.set('This authority no longer exists.');
      this.store.reload();
    } else if (error.status === 409) {
      this.createError.set(detailOf(error) ?? 'This authority already has a framework with this name.');
    } else {
      this.createError.set('The framework could not be created. Try again later.');
    }
  }
}
