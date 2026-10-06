import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarBanner } from 'components';

export const Dismissible: StoryObj<TarBanner> = {
  render: () => {
    const visible = signal(true);
    return {
      props: { visible, dismiss: () => visible.set(false), reset: () => visible.set(true) },
      template: `
        <tar-banner severity="info" icon="campaign" message="The fall city-wide event calendar is published." dismissLabel="Dismiss announcement" [visible]="visible()" (dismissed)="dismiss()" />
        @if (!visible()) {
          <p style="padding: 0 16px"><tar-button variant="text" (clicked)="reset()">Show banner again</tar-button></p>
        }
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`dismissible` (on by default) renders a close icon button (`.tar-banner__close`, `aria-label` from `dismissLabel`) that emits `dismissed`. The banner does not hide itself — the host sets `visible` to false.',
      },
    },
  },
};
