// traces_to: L2-115
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ThemeService } from './theme.service';
import { ACCESS_TOKEN_SOURCE } from '../auth/access-token-source.contract';

function setup(hasToken = false) {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ACCESS_TOKEN_SOURCE, useValue: { current: () => hasToken ? 'tok' : null } },
    ],
  });
  return {
    svc: TestBed.inject(ThemeService),
    ctrl: TestBed.inject(HttpTestingController),
  };
}

describe('ThemeService (domain library)', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('reads mode from localStorage on init', () => {
    localStorage.setItem('theme', 'dark');
    const { svc } = setup();
    expect(svc.mode()).toBe('dark');
    localStorage.removeItem('theme');
  });

  it('defaults to system when no localStorage value', () => {
    localStorage.removeItem('theme');
    const { svc } = setup();
    expect(svc.mode()).toBe('system');
  });

  it('setMode updates mode signal and localStorage', () => {
    const { svc, ctrl } = setup(false);
    svc.setMode('light');
    expect(svc.mode()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
    ctrl.verify();
    localStorage.removeItem('theme');
  });

  it('setMode patches /api/v1/users/me when authenticated', () => {
    const { svc, ctrl } = setup(true);
    svc.setMode('dark');
    ctrl.expectOne('/api/v1/users/me').flush({});
    localStorage.removeItem('theme');
  });

  it('setMode does not call API when unauthenticated', () => {
    const { svc, ctrl } = setup(false);
    svc.setMode('dark');
    ctrl.verify();
    localStorage.removeItem('theme');
  });
});
