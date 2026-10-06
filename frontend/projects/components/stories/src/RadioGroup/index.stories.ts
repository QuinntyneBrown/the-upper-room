import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarRadioGroup } from 'components';

import descriptionMd from './RadioGroupDescription.md';
import bestPracticesMd from './RadioGroupBestPractices.md';

export { Default } from './RadioGroupDefault.stories';
export { Inline } from './RadioGroupInline.stories';
export { Disabled } from './RadioGroupDisabled.stories';
export { BoundToSignal } from './RadioGroupBoundToSignal.stories';

export default {
  title: 'Components/RadioGroup',
  component: TarRadioGroup,
  decorators: [moduleMetadata({ imports: [TarRadioGroup] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarRadioGroup>;
