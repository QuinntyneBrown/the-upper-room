import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarListError } from 'components';

type LoadState = 'error' | 'loading' | 'loaded';

export const RetryFlow: StoryObj<TarListError> = {
  render: () => {
    const state = signal<LoadState>('error');
    const attempts = signal(0);
    return {
      props: {
        state,
        attempts,
        retry: () => {
          attempts.update((n) => n + 1);
          state.set('loading');
          setTimeout(() => state.set(attempts() >= 2 ? 'loaded' : 'error'), 1200);
        },
      },
      template: `
        <div style="max-width: 480px">
          @switch (state()) {
            @case ('error') {
              <tar-list-error correlationId="0HN7Q2K8C1V3F:0000000{{ attempts() + 1 }}" (retry)="retry()" />
            }
            @case ('loading') {
              <tar-skeleton [rowCount]="4" />
            }
            @case ('loaded') {
              <ul class="mat-body-large">
                <li>Northside Food Bank</li>
                <li>Riverdale Youth Centre</li>
                <li>St. Paul's Community Kitchen</li>
              </ul>
            }
          }
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '"Try again" emits `retry`; the page reloads, showing `tar-skeleton` while the request runs. In this demo the first retry fails again (new reference) and the second succeeds.',
      },
    },
  },
};
