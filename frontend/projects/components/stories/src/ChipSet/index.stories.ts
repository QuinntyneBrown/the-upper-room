import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarChip, TarChipSet } from 'components';

import descriptionMd from './ChipSetDescription.md';
import bestPracticesMd from './ChipSetBestPractices.md';

export { Default } from './ChipSetDefault.stories';
export { SingleSelect } from './ChipSetSingleSelect.stories';
export { DisabledOption } from './ChipSetDisabledOption.stories';
export { ProjectedChips } from './ChipSetProjectedChips.stories';

export default {
  title: 'Components/ChipSet',
  component: TarChipSet,
  decorators: [moduleMetadata({ imports: [TarChipSet, TarChip] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarChipSet>;
