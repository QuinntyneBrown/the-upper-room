// traces_to: L2-069
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorBoundaryService } from './error-boundary.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly boundary = inject(ErrorBoundaryService);

  handleError(error: unknown): void {
    console.error(error);
    if (this.isHttpError(error)) return;
    this.boundary.raise();
  }

  private isHttpError(error: unknown): boolean {
    if (error instanceof HttpErrorResponse) return true;
    const inner = (error as { rejection?: unknown } | null)?.rejection;
    return inner instanceof HttpErrorResponse;
  }
}
