import type { StoryObj } from '@storybook/angular';

import { authPage } from './auth';

export const InvitationExpired: StoryObj = {
  name: 'Invitation expired',
  render: () => ({
    template: authPage(`
      <div data-testid="invitation-expired">
        <tar-empty-state icon="schedule" heading="This invitation has expired." body="Ask your city lead to send you a new one.">
          <tar-button icon="send" testId="invitation-request-new">Request a new invite</tar-button>
        </tar-empty-state>
      </div>
    `),
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Dead-end states put a `tar-empty-state` inside the auth card instead of a form: icon, one-line heading, what to do next, and a single action.',
      },
    },
  },
};
