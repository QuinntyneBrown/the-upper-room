// traces_to: L2-084
import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TarButton } from 'components';

@Component({
  selector: 'app-echo-test',
  imports: [TarButton],
  templateUrl: './echo-test.html',
  styleUrl: './echo-test.scss',
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
