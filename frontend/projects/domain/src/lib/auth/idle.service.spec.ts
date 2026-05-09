// traces_to: L2-022
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IdleService } from './idle.service';
import { ACCESS_TOKEN_SOURCE } from './access-token-source.contract';
import { SignOutService } from './sign-out.service';

function setup({ hasToken = true }: { hasToken?: boolean } = {}) {
  let forcedOut = false;
  TestBed.configureTestingModule({
    providers: [
      { provide: ACCESS_TOKEN_SOURCE, useValue: { current: () => hasToken ? 'tok' : null } },
      { provide: SignOutService, useValue: { forceSignOut: () => { forcedOut = true; } } },
    ],
  });
  const svc = TestBed.inject(IdleService);
  return { svc, getForcedOut: () => forcedOut };
}

describe('IdleService (domain library)', () => {
  it('starts in active state', () => {
    const { svc } = setup();
    expect(svc.state()).toBe('active');
  });

  it('stays active when no token is present', fakeAsync(() => {
    const { svc } = setup({ hasToken: false });
    tick(31 * 60 * 1000);
    expect(svc.state()).toBe('active');
  }));

  it('transitions to warning after idle threshold when token is present', fakeAsync(() => {
    const { svc } = setup();
    const IDLE_MS = 30 * 60 * 1000;
    tick(IDLE_MS + 1000);
    expect(svc.state()).toBe('warning');
  }));

  it('resets to active on staySignedIn()', fakeAsync(() => {
    const { svc } = setup();
    const IDLE_MS = 30 * 60 * 1000;
    tick(IDLE_MS + 1000);
    expect(svc.state()).toBe('warning');
    svc.staySignedIn();
    expect(svc.state()).toBe('active');
  }));
});
