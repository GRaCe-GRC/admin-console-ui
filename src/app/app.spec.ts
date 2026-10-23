import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders the header, the page outlet and the notification region', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-header [data-testid="brand"]')?.textContent?.trim()).toBe('GRaCe-GRC');
    expect(element.querySelector('main router-outlet')).not.toBeNull();
    expect(element.querySelector('app-toast [role="status"]')).not.toBeNull();
  });
});
