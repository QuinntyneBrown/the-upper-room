// traces_to: L2-069
import { Injectable, signal } from '@angular/core';

export interface BoundaryError {
  readonly correlationId: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorBoundaryService {
  readonly current = signal<BoundaryError | null>(null);

  raise(): void {
    this.current.set({ correlationId: crypto.randomUUID() });
  }

  clear(): void {
    this.current.set(null);
  }
}
