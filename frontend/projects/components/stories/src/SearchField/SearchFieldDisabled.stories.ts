import type { StoryObj } from '@storybook/angular';

import type { TarSearchField } from 'components';

export const Disabled: StoryObj<TarSearchField> = {
  render: () => ({
    template: `
      <div style="max-width: 480px">
        <tar-search-field placeholder="Search ideas" [disabled]="true" />
      </div>
    `,
  }),
  parameters: { docs: { description: { story: '`disabled` disables the native input.' } } },
};
