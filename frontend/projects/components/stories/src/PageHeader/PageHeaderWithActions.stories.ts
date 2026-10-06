import type { StoryObj } from '@storybook/angular';

import type { TarPageHeader } from 'components';

export const WithActions: StoryObj<TarPageHeader> = {
  render: () => ({
    template: `
      <tar-page-header title="Partners" subtitle="Churches and organisations you work with">
        <tar-icon-button icon="filter_list" ariaLabel="Filter partners" />
        <tar-button icon="add">New partner</tar-button>
      </tar-page-header>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Projected content lands in `.tar-page-header__actions` on the trailing edge — the page’s primary action plus any secondary icon actions.',
      },
    },
  },
};
