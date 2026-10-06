import type { StoryObj } from '@storybook/angular';

import type { TarRadioGroup } from 'components';

export const Disabled: StoryObj<TarRadioGroup> = {
  render: () => {
    return {
      props: {
        templates: [
          { value: 'simple', label: 'To do / Doing / Done' },
          { value: 'events', label: 'Event planning' },
          { value: 'custom', label: 'Custom (coming soon)', disabled: true },
        ],
        methods: [
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'text', label: 'Text message' },
        ],
      },
      template: `
      <div style="display: grid; gap: 24px">
        <tar-radio-group label="Board template" value="simple" [options]="templates" />
        <tar-radio-group label="Preferred contact method" value="phone" [disabled]="true" [options]="methods" />
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'A single option is disabled with `disabled: true` on its `TarRadioOption`; `disabled` on the group disables every option.',
      },
    },
  },
};
