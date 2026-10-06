import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarSelect } from 'components';

import descriptionMd from './SelectDescription.md';
import bestPracticesMd from './SelectBestPractices.md';

export { Default } from './SelectDefault.stories';
export { Placeholder } from './SelectPlaceholder.stories';
export { WithHint } from './SelectWithHint.stories';
export { Disabled } from './SelectDisabled.stories';
export { BoundToSignal } from './SelectBoundToSignal.stories';

export default {
  title: 'Components/Select',
  component: TarSelect,
  decorators: [moduleMetadata({ imports: [TarSelect] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarSelect>;
