import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarTextarea } from 'components';

import descriptionMd from './TextareaDescription.md';
import bestPracticesMd from './TextareaBestPractices.md';

export { Default } from './TextareaDefault.stories';
export { CharacterCount } from './TextareaCharacterCount.stories';
export { Rows } from './TextareaRows.stories';
export { Disabled } from './TextareaDisabled.stories';

export default {
  title: 'Components/Textarea',
  component: TarTextarea,
  decorators: [moduleMetadata({ imports: [TarTextarea] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarTextarea>;
