// traces_to: L2-040
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TarTagSelector } from './tag-selector/tar-tag-selector';
import { PERMISSIONS_SERVICE, IPermissionsService } from '../rbac/permissions.contract';
import { RbacSnapshot } from '../rbac/rbac-snapshot';

const emptySnapshot: RbacSnapshot = { roles: [], permissions: [] };

function mockPerms(permissions: string[] = []): IPermissionsService {
  const snap = signal<RbacSnapshot>({ roles: [], permissions });
  return {
    snapshot: snap,
    set: () => {},
    setFromMe: () => {},
    clear: () => {},
    hasRole: () => false,
    hasPermission: (p: string) => permissions.includes(p),
  } as unknown as IPermissionsService;
}

describe('TarTagSelector (domain library)', () => {
  let fixture: ComponentFixture<TarTagSelector>;
  let ctrl: HttpTestingController;

  function setup(perms: string[] = []) {
    TestBed.configureTestingModule({
      imports: [TarTagSelector],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PERMISSIONS_SERVICE, useValue: mockPerms(perms) },
      ],
    });
    fixture = TestBed.createComponent(TarTagSelector);
    ctrl = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => ctrl.verify());

  it('renders the tag selector container', () => {
    setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="tag-selector"]')).not.toBeNull();
  });

  it('shows create hint when user has Tag:Create permission and text is entered', fakeAsync(() => {
    setup(['Tag:Create']);
    const comp = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('[data-testid="tag-selector-input"]') as HTMLInputElement;

    input.value = 'newTag';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(250);

    ctrl.expectOne((req) => req.url.includes('/api/v1/tags')).flush({ items: [] });
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector('[data-testid="tag-selector-create-hint"]');
    expect(hint).not.toBeNull();
  }));

  it('does not show create hint without Tag:Create permission', fakeAsync(() => {
    setup([]);
    const input = fixture.nativeElement.querySelector('[data-testid="tag-selector-input"]') as HTMLInputElement;

    input.value = 'newTag';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(250);

    ctrl.expectOne((req) => req.url.includes('/api/v1/tags')).flush({ items: [] });
    fixture.detectChanges();

    const hint = fixture.nativeElement.querySelector('[data-testid="tag-selector-create-hint"]');
    expect(hint).toBeNull();
  }));
});
