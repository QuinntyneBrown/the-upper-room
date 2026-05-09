// traces_to: L2-021
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { SignOutService } from './sign-out.service';
import { TOKEN_STORE } from './token-store.contract';
import { ConfirmService, SnackbarService } from 'components';

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
        {
          provide: SnackbarService,
          useValue: { show: () => {} },
        },
      ],
    });

    svc = TestBed.inject(SignOutService);
    ctrl = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  }

  afterEach(() => ctrl.verify());

  it('calls sign-out API and clears token when user confirms', async () => {
    setup(true);
    let navigated = false;
    router.navigateByUrl = () => { navigated = true; return Promise.resolve(true); };

    const signOutPromise = svc.signOut();
    await Promise.resolve(); // drain confirm microtask
    ctrl.expectOne('/api/v1/auth/sign-out').flush({});
    await signOutPromise;

    expect(tokenCleared).toBe(true);
    expect(navigated).toBe(true);
  });

  it('does not call sign-out API when user cancels', async () => {
    setup(false);
    await svc.signOut();
    ctrl.verify();
    expect(tokenCleared).toBe(false);
  });
});
