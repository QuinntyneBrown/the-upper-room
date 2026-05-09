// traces_to: L2-109
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TarCitySwitcher } from './city-switcher/tar-city-switcher';
import { PERMISSIONS_SERVICE, IPermissionsService } from '../rbac/permissions.contract';

function mockPerms(perms: string[] = []): IPermissionsService {
  const snap = signal({ roles: [], permissions: perms });
  return {
    snapshot: snap,
    set: () => {},
    setFromMe: () => {},
    clear: () => {},
    hasPermission: (p: string) => perms.includes(p),
    hasAnyRole: () => false,
  } as unknown as IPermissionsService;
}

describe('TarCitySwitcher (domain library)', () => {
  let fixture: ComponentFixture<TarCitySwitcher>;
  let ctrl: HttpTestingController;

  function setup(perms: string[] = []) {
    TestBed.configureTestingModule({
      imports: [TarCitySwitcher],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PERMISSIONS_SERVICE, useValue: mockPerms(perms) },
      ],
    });
    fixture = TestBed.createComponent(TarCitySwitcher);
    ctrl = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => ctrl.verify());

  it('does not load cities when user lacks City:Switch permission', () => {
    setup([]);
    expect(ctrl.match('/api/v1/cities')).toHaveLength(0);
  });

  it('loads cities when user has City:Switch permission', async () => {
    setup(['City:Switch']);
    ctrl.expectOne('/api/v1/cities').flush({ items: [{ id: '1', name: 'Ottawa', slug: 'ottawa', archived: false }] });
    fixture.detectChanges();
    await fixture.whenStable();

    // Open the dropdown to reveal the city list
    const trigger = fixture.nativeElement.querySelector('[data-testid="city-switcher-trigger"]') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Ottawa');
  });
});
