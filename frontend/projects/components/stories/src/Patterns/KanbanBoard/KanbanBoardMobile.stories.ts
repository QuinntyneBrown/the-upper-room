import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { boardColumnsMarkup, boardHeaderMarkup, boardProps } from './board';

export const Mobile: StoryObj = {
  render: () => ({
    props: { ...shellProps(false), ...boardProps() },
    template: appShell({
      active: 'boards',
      mobile: true,
      content: `${boardHeaderMarkup()}${boardColumnsMarkup('85%')}`,
    }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          "On phones each column takes 85% of the width so the next one peeks in, and the board scrolls sideways. Drag and drop is replaced by the card dialog's Move sheet.",
      },
    },
  },
};
