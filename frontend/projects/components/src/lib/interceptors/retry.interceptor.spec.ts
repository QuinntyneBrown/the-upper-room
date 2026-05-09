// traces_to: L2-084
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { retryInterceptor } from './retry.interceptor';

function setup() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([retryInterceptor])),
      provideHttpClientTesting(),
    ],
  });
  return {
    http: TestBed.inject(HttpClient),
    ctrl: TestBed.inject(HttpTestingController),
  };
}

describe('retryInterceptor (components library)', () => {
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('retries a GET on 503 and succeeds on the third attempt', fakeAsync(() => {
    const { http, ctrl } = setup();
    let result: string | undefined;
    http.get<string>('/api/test').subscribe((v) => (result = String(v)));

    ctrl.expectOne('/api/test').flush(null, { status: 503, statusText: 'Service Unavailable' });
    tick(400);
    ctrl.expectOne('/api/test').flush(null, { status: 503, statusText: 'Service Unavailable' });
    tick(1000);
    ctrl.expectOne('/api/test').flush('ok');
    tick();
    expect(result).toBe('ok');
  }));

  it('does not retry a POST on 503', fakeAsync(() => {
    const { http, ctrl } = setup();
    let errored = false;
    http.post('/api/test', {}).subscribe({ error: () => (errored = true) });

    ctrl.expectOne('/api/test').flush(null, { status: 503, statusText: 'Service Unavailable' });
    tick();
    expect(errored).toBe(true);
    ctrl.verify();
  }));

  it('does not retry on 404 (non-transient error)', fakeAsync(() => {
    const { http, ctrl } = setup();
    let errored = false;
    http.get('/api/missing').subscribe({ error: () => (errored = true) });

    ctrl.expectOne('/api/missing').flush(null, { status: 404, statusText: 'Not Found' });
    tick();
    expect(errored).toBe(true);
    ctrl.verify();
  }));
});
