import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarDivider, TarList, TarListItem } from 'components';

import descriptionMd from './ListDescription.md';
import bestPracticesMd from './ListBestPractices.md';

export { Default } from './ListDefault.stories';
export { WithIcons } from './ListWithIcons.stories';
export { Interactive } from './ListInteractive.stories';

export default {
  title: 'Components/List',
  component: TarList,
  subcomponents: { TarListItem },
  decorators: [moduleMetadata({ imports: [TarList, TarListItem, TarDivider] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarList>;
