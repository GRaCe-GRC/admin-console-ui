import { Component } from '@angular/core';
import { CURRENT_USER } from '../../auth/current-user';
import { LogoMark } from '../logo-mark/logo-mark';

@Component({
  selector: 'app-header',
  imports: [LogoMark],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
})
export class AppHeader {
  protected readonly user = CURRENT_USER;
}
