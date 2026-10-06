import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarTooltip } from 'components';

export const Disabled: StoryObj<TarTooltip> = {
  render: () => {
    const off = signal(true);
    return {
      props: { off, toggle: () => off.update((v) => !v) },
      template: `
        <div style="display: flex; gap: 24px; align-items: center; padding: 48px">
          <tar-icon-button
            icon="view_kanban"
            ariaLabel="Open board"
            tarTooltip="Open the Saturday outreach board"
            [tarTooltipDisabled]="off()"
          />
          <tar-button variant="text" (clicked)="toggle()">
            {{ off() ? 'Enable tooltip' : 'Disable tooltip' }}
          </tar-button>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`tarTooltipDisabled` suppresses the tooltip without removing the directive — for example once the user has dismissed onboarding hints.',
      },
    },
  },
};
