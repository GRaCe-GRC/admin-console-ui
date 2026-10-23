import { TestBed } from '@angular/core/testing';
import { AppHeader } from './app-header';

describe('AppHeader', () => {
  function render(): HTMLElement {
    const fixture = TestBed.createComponent(AppHeader);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows the logo and the product name', () => {
    const element = render();

    expect(element.querySelector('app-logo-mark svg')).not.toBeNull();
    expect(element.querySelector('app-logo-mark')?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('[data-testid="brand"]')?.textContent?.trim()).toBe('GRaCe-GRC');
    expect(element.textContent).toContain('Admin console');
  });

  it('shows the signed-in user with initials', () => {
    const user = render().querySelector('[data-testid="user"]')!;

    expect(user.getAttribute('aria-label')).toBe('Signed in as Compliance Expert');
    expect(user.querySelector('.user-name')?.textContent?.trim()).toBe('Compliance Expert');
    expect(user.querySelector('.avatar')?.textContent?.trim()).toBe('CE');
  });
});
