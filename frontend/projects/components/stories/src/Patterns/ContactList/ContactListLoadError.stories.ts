import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';
import { contactHeaderMarkup, contactListProps } from './contacts';

export const LoadError: StoryObj = {
  name: 'Load error',
  render: () => ({
    props: { ...shellProps(true), ...contactListProps() },
    template: appShell({
      active: 'contacts',
      content: `
        ${contactHeaderMarkup()}
        <tar-list-error correlationId="7f3b2c1d-contacts-0412" />
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'When the request fails the grid is replaced by `tar-list-error`: a fixed heading, the server\'s correlation id for support, and a "Try again" button that emits `retry`. The rest of the page keeps working.',
      },
    },
  },
};
