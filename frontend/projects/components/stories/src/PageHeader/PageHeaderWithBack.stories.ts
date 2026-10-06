import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarPageHeader } from 'components';

export const WithBack: StoryObj<TarPageHeader> = {
  render: () => {
    const backs = signal(0);
    return {
      props: { backs, back: () => backs.update((n) => n + 1) },
      template: `
        <tar-page-header title="Grace Community Church" eyebrow="Partner" subtitle="Toronto · since 2021" [showBack]="true" backLabel="Back to partners" testId="partner-header" (backClicked)="back()">
          <tar-button variant="tonal" icon="edit">Edit partner</tar-button>
        </tar-page-header>
        <p style="padding: 0 24px">Back clicked {{ backs() }} times</p>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`showBack` renders an `arrow_back` icon button (`.tar-page-header__back`, `data-testid="{testId}-back"`) labelled by `backLabel`. It only emits `backClicked` — the page decides where to navigate.',
      },
    },
  },
};
