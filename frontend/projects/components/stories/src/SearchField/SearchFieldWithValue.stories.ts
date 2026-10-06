import type { StoryObj } from '@storybook/angular';

import type { TarSearchField } from 'components';

export const WithValue: StoryObj<TarSearchField> = {
  render: () => ({
    template: `
      <div style="max-width: 480px">
        <tar-search-field label="Search partners" value="food bank" testId="partners-search" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'A non-empty `value` shows the `.tar-search-field__clear` button (`data-testid="partners-search-clear"`).',
      },
    },
  },
};
