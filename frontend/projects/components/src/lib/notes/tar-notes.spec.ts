// traces_to: L2-041, L2-042
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TarNotes } from './tar-notes';

describe('TarNotes (components library)', () => {
  let fixture: ComponentFixture<TarNotes>;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarNotes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TarNotes);
  });

  afterEach(() => httpTesting.verify());

  it('should create', () => {
    fixture.componentRef.setInput('subjectType', 'Contact');
    fixture.componentRef.setInput('subjectId', 'test-id');
    fixture.detectChanges();
    httpTesting.expectOne((req) => req.url.includes('/api/v1/users/me')).flush({ id: 'u1', roles: [] });
    httpTesting
      .expectOne((req) => req.url.includes('/api/v1/notes') && req.urlWithParams.includes('subjectType=Contact'))
      .flush({ items: [], total: 0 });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('GET /api/v1/notes uses subjectType and subjectId from inputs', () => {
    fixture.componentRef.setInput('subjectType', 'Partner');
    fixture.componentRef.setInput('subjectId', 'partner-42');
    fixture.detectChanges();

    httpTesting.expectOne((req) => req.url.includes('/api/v1/users/me')).flush({ id: 'u1', roles: [] });

    const notesReq = httpTesting.expectOne((req) =>
      req.url.includes('/api/v1/notes') &&
      req.params.get('subjectType') === 'Partner' &&
      req.params.get('subjectId') === 'partner-42',
    );
    expect(notesReq.request.method).toBe('GET');
    notesReq.flush({ items: [], total: 0 });
  });
});
