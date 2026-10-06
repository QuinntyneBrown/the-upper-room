import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarProgressSpinner } from 'components';

import descriptionMd from './ProgressSpinnerDescription.md';
import bestPracticesMd from './ProgressSpinnerBestPractices.md';

export { Default } from './ProgressSpinnerDefault.stories';
export { Sizes } from './ProgressSpinnerSizes.stories';
export { Determinate } from './ProgressSpinnerDeterminate.stories';
export { InlineLoading } from './ProgressSpinnerInlineLoading.stories';

export default {
  title: 'Components/ProgressSpinner',
  component: TarProgressSpinner,
  decorators: [moduleMetadata({ imports: [TarProgressSpinner] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarProgressSpinner>;
