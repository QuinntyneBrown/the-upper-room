// Traces to: L2-062
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TarNotificationBell, NotificationDto } from './notification-bell/tar-notification-bell';

function makeNotification(id: string, read = false): NotificationDto {
  return {
    id,
    code: 'test',
    title: `Notification ${id}`,
    body: 'body',
    data: null,
    read,
    createdAt: new Date().toISOString(),
    deepLink: null,
    severity: 'Info',
  };
}

describe('TarNotificationBell', () => {
  let fixture: ComponentFixture<TarNotificationBell>;
  let ctrl: HttpTestingController;

  function setup(): void {
    TestBed.configureTestingModule({
      imports: [TarNotificationBell],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    ctrl = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TarNotificationBell);
  }

  afterEach(() => ctrl.verify());

  it('caps badge label at 99+ when more than 99 unread', async () => {
    setup();
    const items = Array.from({ length: 100 }, (_, i) => makeNotification(String(i), false));
    fixture.detectChanges();
    ctrl.expectOne('/api/v1/notifications').flush({ items, total: 100 });
    fixture.detectChanges();
    await fixture.whenStable();

    const badge = fixture.nativeElement.querySelector(
      '[data-testid="notification-badge"]',
    ) as HTMLElement;
    expect(badge.textContent?.trim()).toBe('99+');
  });

  it('mark-all-read clears unread badge', async () => {
    setup();
    fixture.detectChanges();
    ctrl.expectOne('/api/v1/notifications').flush({ items: [makeNotification('1', false)], total: 1 });
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector(
      '[data-testid="notification-bell"]',
    ) as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const markAllReadBtn = fixture.nativeElement.querySelector(
      '[data-testid="notification-mark-all-read"]',
    ) as HTMLButtonElement;
    markAllReadBtn.click();
    fixture.detectChanges();
    ctrl.expectOne('/api/v1/notifications/read-all').flush({});
    fixture.detectChanges();
    await fixture.whenStable();

    const badge = fixture.nativeElement.querySelector('[data-testid="notification-badge"]');
    expect(badge).toBeNull();
  });
});
