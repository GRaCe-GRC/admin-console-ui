import { Component } from '@angular/core';

@Component({
  selector: 'app-logo-mark',
  host: { 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 96 96" focusable="false">
      <path d="M48 22 L20 70 L76 70 Z" fill="none" stroke="rgba(255,255,255,.9)" stroke-width="5" stroke-linejoin="round" />
      <circle cx="48" cy="22" r="13" fill="#16A37E" stroke="#FFFFFF" stroke-width="3" />
      <circle cx="20" cy="70" r="13" fill="#3D6BEA" stroke="#FFFFFF" stroke-width="3" />
      <circle cx="76" cy="70" r="13" fill="#9461F2" stroke="#FFFFFF" stroke-width="3" />
    </svg>
  `,
  styles: `
    :host {
      display: block;
      width: 40px;
      height: 40px;
      flex: none;
    }

    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class LogoMark {}
