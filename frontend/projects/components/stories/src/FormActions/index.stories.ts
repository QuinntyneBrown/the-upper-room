import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarFormActions, TarTextField } from 'components';

import descriptionMd from './FormActionsDescription.md';
import bestPracticesMd from './FormActionsBestPractices.md';

export { Default } from './FormActionsDefault.stories';
export { States } from './FormActionsStates.stories';
export { Alignment } from './FormActionsAlignment.stories';
export { Sticky } from './FormActionsSticky.stories';
export { WithForm } from './FormActionsWithForm.stories';

export default {
  title: 'Components/FormActions',
  component: TarFormActions,
  decorators: [moduleMetadata({ imports: [TarFormActions, TarTextField] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarFormActions>;
