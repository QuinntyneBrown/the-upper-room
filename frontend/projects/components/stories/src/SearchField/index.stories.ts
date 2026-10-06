import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarSearchField } from 'components';

import descriptionMd from './SearchFieldDescription.md';
import bestPracticesMd from './SearchFieldBestPractices.md';

export { Default } from './SearchFieldDefault.stories';
export { WithValue } from './SearchFieldWithValue.stories';
export { FilteringList } from './SearchFieldFilteringList.stories';
export { Disabled } from './SearchFieldDisabled.stories';

export default {
  title: 'Components/SearchField',
  component: TarSearchField,
  decorators: [moduleMetadata({ imports: [TarSearchField] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarSearchField>;
