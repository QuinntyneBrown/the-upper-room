import type { StoryObj } from '@storybook/angular';

import type { TarSelect } from 'components';

export const Placeholder: StoryObj<TarSelect> = {
  render: () => {
    return {
      props: {
        stages: [
          { value: 'new', label: 'New' },
          { value: 'exploring', label: 'Exploring' },
          { value: 'committed', label: 'Committed' },
          { value: 'parked', label: 'Parked' },
        ],
      },
      template: `
      <div style="max-width: 360px">
        <tar-select placeholder="All stages" ariaLabel="Filter ideas by stage" [options]="stages" />
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'A filter-bar select with a `placeholder` and no `value`. Without a visible label, `ariaLabel` names the control.',
      },
    },
  },
};
