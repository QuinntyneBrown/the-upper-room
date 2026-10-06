import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import type { OfflineBanner } from 'components';

import { NetworkServiceStub, provideNetworkStub } from './network-stub';

export const Default: StoryObj<OfflineBanner> = {
  decorators: [
    moduleMetadata({ providers: [provideNetworkStub(new NetworkServiceStub('offline'))] }),
  ],
  render: () => ({
    template: `<app-offline-banner />`,
  }),
};
