// traces_to: L2-114
import { WritableSignal } from '@angular/core';
import { Observable } from 'rxjs';

export function optimisticMutation<T>(
  state: WritableSignal<T>,
  next: T,
  mutate: () => Observable<unknown>,
  onError: () => void,
): void {
  const previous = state();
  state.set(next);
  mutate().subscribe({
    error: (err: { status?: number }) => {
      if (!err?.status || err.status >= 500) {
        state.set(previous);
        onError();
      }
    },
  });
}
