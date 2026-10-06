import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarMenu } from 'components';

import descriptionMd from './MenuDescription.md';
import bestPracticesMd from './MenuBestPractices.md';

export { Default } from './MenuDefault.stories';
export { RowActions } from './MenuRowActions.stories';
export { CustomTrigger } from './MenuCustomTrigger.stories';
export { Open } from './MenuOpen.stories';

export default {
  title: 'Components/Menu',
  component: TarMenu,
  decorators: [moduleMetadata({ imports: [TarMenu] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarMenu>;
