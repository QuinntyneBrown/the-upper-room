// traces_to: L2-070
import { TestBed } from '@angular/core/testing';
import { NetworkService } from './network.service';

describe('NetworkService (components library)', () => {
  let svc: NetworkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    svc = TestBed.inject(NetworkService);
  });

  it('should create', () => {
    expect(svc).toBeTruthy();
  });

  it('bannerState is "offline" after offline event', () => {
    window.dispatchEvent(new Event('offline'));
    expect(svc.bannerState()).toBe('offline');
  });

  it('bannerState is "online" immediately after online event', () => {
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
    expect(svc.bannerState()).toBe('online');
  });

  it('bannerState is null after dismiss()', () => {
    window.dispatchEvent(new Event('offline'));
    svc.dismiss();
    expect(svc.bannerState()).toBeNull();
  });
});
