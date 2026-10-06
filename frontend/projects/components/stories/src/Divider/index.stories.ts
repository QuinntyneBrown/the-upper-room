import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarDivider } from 'components';

import descriptionMd from './DividerDescription.md';
import bestPracticesMd from './DividerBestPractices.md';

export { Default } from './DividerDefault.stories';
export { Vertical } from './DividerVertical.stories';
export { Inset } from './DividerInset.stories';

export default {
  title: 'Components/Divider',
  component: TarDivider,
  decorators: [moduleMetadata({ imports: [TarDivider] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarDivider>;
