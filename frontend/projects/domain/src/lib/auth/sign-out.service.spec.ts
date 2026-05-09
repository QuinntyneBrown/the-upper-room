// traces_to: L2-021
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { SignOutService } from './sign-out.service';
import { TOKEN_STORE } from './token-store.contract';
import { ConfirmService } from 'components';

describe('SignOutService (domain library)', () => {
  let svc: SignOutService;
  let ctrl: HttpTestingController;
  let router: Router;
  let tokenCleared: boolean;
  let confirmResult: boolean;

  function setup(shouldConfirm: boolean) {
    confirmResult = shouldConfirm;
    tokenCleared = false;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: TOKEN_STORE,
          useValue: { set: () => { tokenCleared = true; } },
        },
        {
          provide: ConfirmService,
          useValue: { confirm: () => Promise.resolve(confirmResult) },
        },
      ],
    });

    svc = TestBed.inject(SignOutService);
    ctrl = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  afterEach(() => ctrl.verify());

  it('calls sign-out API and clears token when user confirms', fakeAsync(() => {
    setup(true);
    let navigated = false;
    jest.spyOn(router, 'navigateByUrl').mockImplementation(() => { navigated = true; return Promise.resolve(true); });

    void svc.signOut();
    tick();

    ctrl.expectOne('/api/v1/auth/sign-out').flush({});
    tick();

    expect(tokenCleared).toBe(true);
    expect(navigated).toBe(true);
  }));

  it('does not call sign-out API when user cancels', fakeAsync(() => {
    setup(false);
    void svc.signOut();
    tick();

    ctrl.verify();
    expect(tokenCleared).toBe(false);
  }));
});
