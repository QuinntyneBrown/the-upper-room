import type { StoryObj } from '@storybook/angular';

import type { TarPagination } from 'components';

export const Compact: StoryObj<TarPagination> = {
  render: () => ({
    template: `
      <div style="max-width: 420px">
        <tar-pagination
          [length]="42"
          [pageSize]="10"
          [hidePageSize]="true"
          [showFirstLastButtons]="false"
          testId="events-pagination"
        />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          '`hidePageSize` removes the page-size select and `showFirstLastButtons="false"` keeps only previous/next — for narrow panels such as a city\'s upcoming events.',
      },
    },
  },
};
