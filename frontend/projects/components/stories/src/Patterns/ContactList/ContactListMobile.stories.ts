import type { StoryObj } from '@storybook/angular';

import { GUTTER, appShell, shellProps } from '../shared/shell';
import { contactGridMarkup, contactHeaderMarkup, contactListProps } from './contacts';

export const Mobile: StoryObj = {
  render: () => ({
    props: { ...shellProps(false), ...contactListProps() },
    template: appShell({
      active: 'contacts',
      mobile: true,
      content: `
        ${contactHeaderMarkup(true)}
        ${contactGridMarkup('1fr')}
        <div style="${GUTTER}">
          <tar-button variant="outlined" testId="contacts-load-more" [fullWidth]="true">Load more</tar-button>
        </div>
        <div style="position: fixed; right: var(--md-sys-space-4); bottom: var(--md-sys-space-4); z-index: 5">
          <tar-fab icon="person_add" ariaLabel="New contact" testId="contacts-fab" />
        </div>
      `,
    }),
  }),
  globals: { viewport: { value: 'mobile' } },
  parameters: {
    docs: {
      description: {
        story:
          'Below 576px the grid collapses to one column, pagination becomes a full-width "Load more" button, and "New contact" moves from the header into a `tar-fab` pinned to the bottom-right corner.',
      },
    },
  },
};
