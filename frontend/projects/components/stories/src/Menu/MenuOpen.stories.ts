import type { StoryObj } from '@storybook/angular';

import type { TarMenu, TarMenuItem } from 'components';

export const Open: StoryObj<TarMenu> = {
  render: () => {
    const items: TarMenuItem[] = [
      { id: 'edit', label: 'Edit location', icon: 'edit' },
      { id: 'directions', label: 'Get directions', icon: 'directions' },
      { id: 'events', label: 'View events here', icon: 'event' },
      { id: 'divider', label: '', divider: true },
      { id: 'archive', label: 'Archive location', icon: 'archive', danger: true },
    ];
    return {
      props: { items },
      template: `
        <div style="min-height: 280px">
          <tar-menu [items]="items" ariaLabel="Location actions" testId="location-menu" />
        </div>
      `,
    };
  },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('[data-testid="location-menu"]')?.click();
  },
  parameters: {
    docs: {
      description: {
        story:
          'The open panel: a `mat-menu` (`.tar-menu`) in a CDK overlay with `.tar-menu__item` buttons, each with an optional `.tar-menu__icon` and a `.tar-menu__label`.',
      },
    },
  },
};
