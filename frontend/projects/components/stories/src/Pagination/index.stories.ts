import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarPagination } from 'components';

import descriptionMd from './PaginationDescription.md';
import bestPracticesMd from './PaginationBestPractices.md';

export { Default } from './PaginationDefault.stories';
export { Interactive } from './PaginationInteractive.stories';
export { Compact } from './PaginationCompact.stories';

export default {
  title: 'Components/Pagination',
  component: TarPagination,
  decorators: [moduleMetadata({ imports: [TarPagination] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarPagination>;
