import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarSearchField } from 'components';

export const FilteringList: StoryObj<TarSearchField> = {
  render: () => {
    const query = signal('');
    const all = [
      'Northside Community Hall',
      'Riverside Food Bank warehouse',
      'St. Andrew’s church basement',
      'Harbourfront library, room 2',
      'Eastgate youth centre',
    ];
    return {
      props: {
        query,
        results: () => all.filter((l) => l.toLowerCase().includes(query().toLowerCase())),
      },
      template: `
      <div style="max-width: 480px">
        <tar-search-field placeholder="Search locations" [value]="query()" (valueChange)="query.set($event)" />
        <ul style="margin: 0; padding-inline-start: 20px">
          @for (loc of results(); track loc) {
            <li>{{ loc }}</li>
          } @empty {
            <li style="color: var(--md-sys-color-on-surface-variant)">No locations match “{{ query() }}”</li>
          }
        </ul>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Live filtering bound to a signal. Type to narrow the list; the clear button emits an empty `valueChange`, resetting it.',
      },
    },
  },
};
