import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { boardColumnsMarkup, boardHeaderMarkup, boardProps } from './board';

export const Columns: StoryObj = {
  render: () => ({
    props: { ...shellProps(true), ...boardProps() },
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
          "The default Columns view of `/boards/:id`. Each column header shows its card count, and `count / limit` when it has a WIP limit. Cards are outlined interactive `tar-card`s with the title, tag `tar-chip`s, the assignee's 24px `tar-avatar` and the due date (in the error colour when overdue). Toggle the tag chips or Show archived to filter.",
      },
    },
  },
};
