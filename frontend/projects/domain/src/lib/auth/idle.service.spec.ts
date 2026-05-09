// traces_to: L2-022
import { TestBed } from '@angular/core/testing';
import { IdleService } from './idle.service';
import { ACCESS_TOKEN_SOURCE } from './access-token-source.contract';
import { SIGN_OUT_SERVICE } from './sign-out.service.contract';

const IDLE_MS = 30 * 60 * 1000;

class TestIdleService extends IdleService {
  advanceTime(ms: number): void {
    // Simulate elapsed time by calling tick with a manipulated lastActivity
    (this as unknown as { lastActivity: number }).lastActivity = Date.now() - ms;
    this.tick();
  }
}

function setup({ hasToken = true }: { hasToken?: boolean } = {}) {
  let forcedOut = false;
  TestBed.configureTestingModule({
    providers: [
      { provide: IdleService, useClass: TestIdleService },
      { provide: ACCESS_TOKEN_SOURCE, useValue: { current: () => hasToken ? 'tok' : null } },
      { provide: SIGN_OUT_SERVICE, useValue: { forceSignOut: () => { forcedOut = true; } } },
    ],
  });
  const svc = TestBed.inject(IdleService) as TestIdleService;
  return { svc, getForcedOut: () => forcedOut };
}

describe('IdleService (domain library)', () => {
  it('starts in active state', () => {
    const { svc } = setup();
    expect(svc.state()).toBe('active');
  });

  it('stays active when no token is present', () => {
    const { svc } = setup({ hasToken: false });
    svc.advanceTime(IDLE_MS + 1000);
    expect(svc.state()).toBe('active');
  });

  it('transitions to warning after idle threshold when token is present', () => {
    const { svc } = setup();
    svc.advanceTime(IDLE_MS + 1000);
    expect(svc.state()).toBe('warning');
  });

  it('resets to active on staySignedIn()', () => {
    const { svc } = setup();
    svc.advanceTime(IDLE_MS + 1000);
    expect(svc.state()).toBe('warning');
    svc.staySignedIn();
    expect(svc.state()).toBe('active');
  });
});
