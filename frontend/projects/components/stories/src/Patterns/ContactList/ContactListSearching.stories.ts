import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { contactGridMarkup, contactHeaderMarkup, contactListProps } from './contacts';

export const Searching: StoryObj = {
  render: () => ({
    props: { ...shellProps(true), ...contactListProps('newcomer hub') },
    template: appShell({
      active: 'contacts',
      content: `${contactHeaderMarkup()}${contactGridMarkup()}`,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'Search matches name, organisation, email and phone. While the query has text, `tar-search-field` shows its clear button (`.tar-search-field__clear`). Pagination is hidden when the results fit one page. Change the query to something with no match to see the no-results `tar-empty-state` with a "Clear search" action.',
      },
    },
  },
};
