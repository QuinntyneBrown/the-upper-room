import type { StoryObj } from '@storybook/angular';

import type { TarChipOption, TarChipSet } from 'components';

export const DisabledOption: StoryObj<TarChipSet> = {
  render: () => {
    const options: TarChipOption[] = [
      { value: 'backlog', label: 'Backlog' },
      { value: 'in-progress', label: 'In progress' },
      { value: 'done', label: 'Done' },
      { value: 'archived', label: 'Archived', disabled: true },
    ];
    return {
      props: { options },
      template: `<tar-chip-set [single]="true" value="in-progress" [options]="options" ariaLabel="Board column" />`,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Set `disabled: true` on a `TarChipOption` to show a choice that is not currently available.',
      },
    },
  },
};
