import { computed, signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarBadge } from 'components';

export const LiveCount: StoryObj<TarBadge> = {
  render: () => {
    const unread = signal(2);
    return {
      props: {
        unread,
        label: computed(() => `Partner requests, ${unread()} unread`),
        add: () => unread.update((n) => n + 1),
        clear: () => unread.set(0),
      },
      template: `
        <div style="display: flex; gap: 16px; align-items: center; padding: 16px">
          <tar-icon-button
            icon="handshake"
            [ariaLabel]="label()"
            [tarBadge]="unread()"
            [tarBadgeHidden]="unread() === 0"
          />
          <tar-button variant="tonal" (clicked)="add()">New request</tar-button>
          <tar-button variant="text" (clicked)="clear()">Mark all read</tar-button>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          "Bind `tarBadge` to a count and hide the badge with `tarBadgeHidden` when it reaches zero. Keep the host's accessible name in step with the count.",
      },
    },
  },
};
