// traces_to: L2-099
import { Injectable, signal } from '@angular/core';

export type ConfirmSeverity = 'info' | 'warning' | 'danger';

export interface ConfirmOptions {
  readonly title: string;
  readonly body?: string;
  readonly severity?: ConfirmSeverity;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly requireTypedConfirmation?: string;
}

export interface ConfirmRequest extends ConfirmOptions {
  readonly resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<ConfirmRequest | null>(null);

  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.current.set({ ...options, resolve });
    });
  }

  resolve(result: boolean): void {
    const req = this.current();
    if (!req) return;
    this.current.set(null);
    req.resolve(result);
  }
}
