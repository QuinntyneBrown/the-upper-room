// traces_to: L2-084
import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-echo-test',
  template: `
    <button data-testid="echo-get" type="button" (click)="get()">GET</button>
    <button data-testid="echo-post" type="button" (click)="post()">POST</button>
    <pre data-testid="echo-result">{{ result() }}</pre>
    <span data-testid="echo-correlation-id">{{ corrId() }}</span>
  `,
  styles: [':host { display: grid; gap: var(--md-sys-space-2); }'],
})
export class EchoTest {
  private readonly http = inject(HttpClient);
  protected readonly result = signal('');
  protected readonly corrId = signal('');

  get(): void {
    this.http
      .get('/api/v1/echo', { observe: 'response' })
      .subscribe((res) => this.handle(res.body, res.headers));
  }

  post(): void {
    this.http
      .post('/api/v1/echo', {}, { observe: 'response' })
      .subscribe({
        next: (res) => this.handle(res.body, res.headers),
        error: () => this.result.set('error'),
      });
  }

  private handle(body: unknown, headers: HttpHeaders): void {
    this.result.set(JSON.stringify(body));
    this.corrId.set(headers.get('X-Correlation-Id') ?? '');
  }
}
