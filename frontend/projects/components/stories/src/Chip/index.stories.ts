import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, TarChip } from 'components';

import descriptionMd from './ChipDescription.md';
import bestPracticesMd from './ChipBestPractices.md';

export { Default } from './ChipDefault.stories';
export { WithIcon } from './ChipWithIcon.stories';
export { Selectable } from './ChipSelectable.stories';
export { Removable } from './ChipRemovable.stories';
export { Disabled } from './ChipDisabled.stories';

export default {
  title: 'Components/Chip',
  component: TarChip,
  decorators: [moduleMetadata({ imports: [TarChip, TarButton] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarChip>;
