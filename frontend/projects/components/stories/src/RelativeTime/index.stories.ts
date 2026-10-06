import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarRelativeTime } from 'components';

import descriptionMd from './RelativeTimeDescription.md';
import bestPracticesMd from './RelativeTimeBestPractices.md';

export { Default } from './RelativeTimeDefault.stories';
export { Ranges } from './RelativeTimeRanges.stories';
export { InActivityFeed } from './RelativeTimeInActivityFeed.stories';

export default {
  title: 'Components/RelativeTime',
  component: TarRelativeTime,
  decorators: [moduleMetadata({ imports: [TarRelativeTime] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarRelativeTime>;
