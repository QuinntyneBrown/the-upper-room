import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { OfflineBanner } from 'components';

import { NetworkServiceStub, provideNetworkStub } from './network-stub';

export const BackOnline: StoryObj<OfflineBanner> = {
  decorators: [
    moduleMetadata({ providers: [provideNetworkStub(new NetworkServiceStub('online'))] }),
  ],
  render: () => ({
    template: `<app-offline-banner />`,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'When the connection returns, the banner switches to a success "Back online" message for three seconds, then hides itself.',
      },
    },
  },
};
