import type { Meta } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarPasswordStrength } from 'components';

import descriptionMd from './PasswordStrengthDescription.md';
import bestPracticesMd from './PasswordStrengthBestPractices.md';

export { Default } from './PasswordStrengthDefault.stories';
export { Levels } from './PasswordStrengthLevels.stories';
export { CommonPassword } from './PasswordStrengthCommonPassword.stories';
export { ContainsEmail } from './PasswordStrengthContainsEmail.stories';
export { Interactive } from './PasswordStrengthInteractive.stories';

export default {
  title: 'Components/PasswordStrength',
  component: TarPasswordStrength,
  decorators: [moduleMetadata({ imports: [TarPasswordStrength] })],
  parameters: {
    docs: {
      description: {
        component: [descriptionMd, bestPracticesMd].join('\n'),
      },
    },
  },
} as Meta<TarPasswordStrength>;
