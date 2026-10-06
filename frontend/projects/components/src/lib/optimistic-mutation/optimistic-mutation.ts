// traces_to: L2-114
import { WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';

export function optimisticMutation<T>(
  state: WritableSignal<T>,
  next: T,
  mutate: () => Observable<unknown>,
  onError: () => void,
  onSuccess?: () => void,
): void {
  const previous = state();
  state.set(next);
  mutate().subscribe({
    next: () => onSuccess?.(),
    error: (err: { status?: number }) => {
      if (!err?.status || err.status >= 500) {
        state.set(previous);
        onError();
      }
    },
  });
}
