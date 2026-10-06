import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { boardColumnsMarkup, boardHeaderMarkup, boardProps } from './board';

export const Filtered: StoryObj = {
  name: 'Filtered by tag',
  render: () => ({
    props: { ...shellProps(true), ...boardProps(undefined, ['Donors']) },
    template: appShell({
      active: 'boards',
      content: `${boardHeaderMarkup()}${boardColumnsMarkup()}`,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'With the "Donors" chip selected only matching cards stay; selecting more tags widens the match (any tag). Column counts keep showing the column\'s real total so WIP limits are never hidden by a filter, and a column with nothing left says so instead of collapsing.',
      },
    },
  },
};
