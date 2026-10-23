import { TestBed } from '@angular/core/testing';
import { Notifications } from '../notifications';
import { Toast } from './toast';

describe('Toast', () => {
  it('shows the current notification and nothing otherwise', () => {
    const fixture = TestBed.createComponent(Toast);
    const notifications = TestBed.inject(Notifications);
    const element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();

    expect(element.querySelector('[data-testid="toast"]')).toBeNull();
    expect(element.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite');

    notifications.show('Authority created');
    fixture.detectChanges();
    expect(element.querySelector('[data-testid="toast"]')?.textContent?.trim()).toBe('Authority created');

    notifications.dismiss();
    fixture.detectChanges();
    expect(element.querySelector('[data-testid="toast"]')).toBeNull();
  });
});
