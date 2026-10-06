import type { StoryObj } from '@storybook/angular';

import type { TarChip } from 'components';

export const Default: StoryObj<TarChip> = {
  args: {
    label: 'Volunteer',
    icon: null,
    selectable: false,
    selected: false,
    removable: false,
    disabled: false,
    testId: 'tag-volunteer',
  },
  render: (args) => ({
    props: args,
    template: `<tar-chip [label]="label" [icon]="icon" [selectable]="selectable" [selected]="selected" [removable]="removable" [disabled]="disabled" [testId]="testId" />`,
  }),
};
