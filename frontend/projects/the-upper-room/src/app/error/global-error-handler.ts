// traces_to: L2-069
import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ErrorBoundaryService } from './error-boundary.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly boundary = inject(ErrorBoundaryService);

  handleError(error: unknown): void {
    console.error(error);
    this.boundary.raise();
  }
}
