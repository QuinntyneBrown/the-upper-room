import type { StoryObj } from '@storybook/angular';

import type { TarBanner } from 'components';

export const Severity: StoryObj<TarBanner> = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 8px">
        <tar-banner severity="info" icon="info" message="Board sharing is now available for city leads." [dismissible]="false" />
        <tar-banner severity="success" icon="check_circle" message="12 contacts were imported from the spreadsheet." [dismissible]="false" />
        <tar-banner severity="warning" icon="warning" message="This event has no location yet." [dismissible]="false" />
        <tar-banner severity="error" icon="error" message="Partners couldn’t be loaded. Check your connection and try again." [dismissible]="false" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`severity` adds `.tar-banner--{severity}`: info uses secondary-container, success and warning both use tertiary-container (so pick a distinct `icon`), error uses error-container. Only `error` is announced with `role="alert"`; the rest use `role="status"`.',
      },
    },
  },
};
