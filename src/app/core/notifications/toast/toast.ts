import { Component, inject } from '@angular/core';
import { Notifications } from '../notifications';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  protected readonly notifications = inject(Notifications);
}
