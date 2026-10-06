import type { StoryObj } from '@storybook/angular';

import type { TarListError } from 'components';

export const InPanel: StoryObj<TarListError> = {
  render: () => ({
    template: `
      <section
        style="max-width: 420px; border-radius: 12px; background: var(--md-sys-color-surface-container); color: var(--md-sys-color-on-surface)"
      >
        <h3 class="mat-title-medium" style="margin: 0; padding: 16px 16px 0">Upcoming events — Vancouver</h3>
        <tar-list-error correlationId="0HN7Q2K8C1V3F:0000002A" />
      </section>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          "Inside a dashboard panel the error replaces only that panel's list, so the rest of the page keeps working.",
      },
    },
  },
};
