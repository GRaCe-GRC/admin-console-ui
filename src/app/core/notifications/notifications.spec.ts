import { TestBed } from '@angular/core/testing';
import { Notifications } from './notifications';

describe('Notifications', () => {
  let notifications: Notifications;

  beforeEach(() => {
    vi.useFakeTimers();
    notifications = TestBed.inject(Notifications);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a message and hides it after a while', () => {
    notifications.show('Authority created');
    expect(notifications.message()).toBe('Authority created');

    vi.advanceTimersByTime(Notifications.DURATION_MS - 1);
    expect(notifications.message()).toBe('Authority created');

    vi.advanceTimersByTime(1);
    expect(notifications.message()).toBeNull();
  });

  it('restarts the timer when a new message arrives', () => {
    notifications.show('Authority created');
    vi.advanceTimersByTime(Notifications.DURATION_MS - 100);
    notifications.show('Authority deleted');
    vi.advanceTimersByTime(200);

    expect(notifications.message()).toBe('Authority deleted');
  });

  it('hides the message on dismiss', () => {
    notifications.show('Authority created');
    notifications.dismiss();

    expect(notifications.message()).toBeNull();
  });
});
