import type { StoryObj } from '@storybook/angular';

import { appShell, shellProps } from '../shared/shell';

export const Empty: StoryObj = {
  name: 'Empty city',
  render: () => ({
    props: shellProps(true),
    template: appShell({
      active: 'contacts',
      content: `
        <tar-page-header title="Contacts" eyebrow="Hamilton" />
        <div data-testid="contacts-empty-state">
          <tar-empty-state icon="person_add" heading="No contacts yet" body="Add your first contact to get started.">
            <tar-button icon="person_add" testId="contacts-new-button">New contact</tar-button>
          </tar-empty-state>
        </div>
      `,
    }),
  }),
  globals: { viewport: { value: 'desktop' } },
  parameters: {
    docs: {
      description: {
        story:
          'A city with no contacts at all. Search and filters are hidden because there is nothing to narrow; the single call to action moves into the `tar-empty-state` actions slot and the header action is dropped so it is not repeated.',
      },
    },
  },
};
