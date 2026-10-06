import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarBanner } from 'components';

export const WithAction: StoryObj<TarBanner> = {
  render: () => {
    const retries = signal(0);
    return {
      props: { retries, retry: () => retries.update((n) => n + 1) },
      template: `
        <tar-banner severity="error" icon="cloud_off" message="Kanban board changes couldn’t be saved." actionLabel="Retry" [dismissible]="false" testId="save-banner" (actioned)="retry()" />
        <p style="padding: 0 16px">Retries: {{ retries() }}</p>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`actionLabel` renders a text button (`.tar-banner__action`, `data-testid="{testId}-action"`) that emits `actioned`.',
      },
    },
  },
};
