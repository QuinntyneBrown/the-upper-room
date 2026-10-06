import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarNavItem } from 'components';

export const AsButton: StoryObj<TarNavItem> = {
  render: () => {
    const city = signal('Toronto');
    const cities = ['Toronto', 'Hamilton', 'Ottawa'];
    return {
      props: {
        city,
        next: () => city.set(cities[(cities.indexOf(city()) + 1) % cities.length]),
      },
      template: `
        <nav aria-label="City" style="max-width: 280px">
          <tar-list [role]="null">
            <tar-nav-item [label]="'City: ' + city()" icon="location_city" testId="nav-switch-city" (clicked)="next()" />
          </tar-list>
        </nav>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Without `routerLink` the item renders a `<button type="button" mat-list-item>` and only emits `clicked` — for actions in the navigation such as switching city or signing out.',
      },
    },
  },
};
