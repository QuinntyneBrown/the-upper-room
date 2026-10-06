import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarCheckbox } from 'components';

import descriptionMd from './CheckboxDescription.md';
import bestPracticesMd from './CheckboxBestPractices.md';

export { Default } from './CheckboxDefault.stories';
export { States } from './CheckboxStates.stories';
export { SelectAll } from './CheckboxSelectAll.stories';

export default {
  title: 'Components/Checkbox',
  component: TarCheckbox,
  decorators: [moduleMetadata({ imports: [TarCheckbox] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarCheckbox>;
