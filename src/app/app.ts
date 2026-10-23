import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from './core/layout/app-header/app-header';
import { Toast } from './core/notifications/toast/toast';

@Component({
  imports: [RouterOutlet, AppHeader, Toast],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
