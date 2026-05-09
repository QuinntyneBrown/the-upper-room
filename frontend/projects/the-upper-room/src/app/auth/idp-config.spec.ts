// Traces to: TASK-0212
import { TestBed } from '@angular/core/testing';
import { IDP_CONFIG } from './idp-config';

describe('IDP_CONFIG (TASK-0212)', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('derives redirectUri from window.location.origin', () => {
    const cfg = TestBed.inject(IDP_CONFIG);
    expect(cfg.redirectUri).toBe(`${window.location.origin}/auth/callback`);
  });

  it('uses the runtime origin (no hardcoded host)', () => {
    const cfg = TestBed.inject(IDP_CONFIG);
    expect(cfg.redirectUri.startsWith(window.location.origin)).toBe(true);
  });
});
