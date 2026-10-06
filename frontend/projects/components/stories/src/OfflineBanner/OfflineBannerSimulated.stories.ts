import type { StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';

import { TarButton, type OfflineBanner } from 'components';

import { NetworkServiceStub, provideNetworkStub } from './network-stub';

const network = new NetworkServiceStub('offline');

export const Simulated: StoryObj<OfflineBanner> = {
  decorators: [moduleMetadata({ imports: [TarButton], providers: [provideNetworkStub(network)] })],
  render: () => ({
    props: { network },
    template: `
      <div style="display: grid; gap: 16px">
        <app-offline-banner />
        <div style="display: flex; flex-wrap: wrap; gap: 12px">
          <tar-button variant="outlined" icon="wifi_off" (clicked)="network.bannerState.set('offline')">Go offline</tar-button>
          <tar-button variant="outlined" icon="wifi" (clicked)="network.bannerState.set('online')">Come back online</tar-button>
        </div>
        <p style="margin: 0; font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface-variant)">
          Banner state: {{ network.bannerState() ?? 'hidden' }}
        </p>
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'Drive the stubbed `NetworkService` with the buttons. The close button calls `NetworkService.dismiss()`, which hides the banner until the connection changes again.',
      },
    },
  },
};
