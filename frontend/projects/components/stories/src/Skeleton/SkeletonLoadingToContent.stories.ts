import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarSkeleton } from 'components';

export const LoadingToContent: StoryObj<TarSkeleton> = {
  render: () => {
    const loading = signal(true);
    return {
      props: { loading, toggle: () => loading.update((v) => !v) },
      template: `
        <div style="display: grid; gap: 16px; max-width: 480px">
          <div><tar-button variant="tonal" (clicked)="toggle()">{{ loading() ? 'Finish loading' : 'Reload' }}</tar-button></div>
          <div [attr.aria-busy]="loading()">
            @if (loading()) {
              <tar-skeleton [rowCount]="3" />
            } @else {
              <ul class="mat-body-large" style="margin: 0">
                <li>Ama Mensah — Volunteer coordinator</li>
                <li>Luc Tremblay — Northside Food Bank</li>
                <li>Priya Natarajan — Board member</li>
              </ul>
            }
          </div>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Swap the skeleton for the real list when data arrives. The skeleton itself exposes no ARIA, so mark the region `aria-busy` while it loads.',
      },
    },
  },
};
