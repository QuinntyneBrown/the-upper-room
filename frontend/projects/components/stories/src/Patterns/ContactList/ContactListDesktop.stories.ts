import type { StoryObj } from '@storybook/angular';

import { GUTTER, appShell, shellProps } from '../shared/shell';
import { contactGridMarkup, contactHeaderMarkup, contactListProps } from './contacts';

export const Desktop: StoryObj = {
  render: () => ({
    props: { ...shellProps(true), ...contactListProps() },
    template: appShell({
      active: 'contacts',
      content: `
        ${contactHeaderMarkup()}
        ${contactGridMarkup()}
        <div style="${GUTTER}">
          <tar-pagination testId="contacts-paginator" [length]="128" [pageSize]="12" [pageSizeOptions]="[12, 24, 48]" />
        </div>
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'The default `/contacts` screen: page header with the primary "New contact" action, a search field and the Archived filter chip, a responsive grid of outlined `tar-card`s and `tar-pagination` underneath. Type in the search field or toggle Archived: both filter live.',
      },
    },
  },
};
