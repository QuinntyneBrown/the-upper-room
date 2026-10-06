import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarChip } from 'components';

export const Removable: StoryObj<TarChip> = {
  render: () => {
    const initial = ['Volunteer', 'Donor', 'Board member', 'Ottawa'];
    const tags = signal(initial);
    return {
      props: {
        tags,
        remove: (tag: string) => tags.update((list) => list.filter((t) => t !== tag)),
        reset: () => tags.set(initial),
      },
      template: `
        <div style="display: grid; gap: 12px">
          <div style="display: flex; flex-wrap: wrap; gap: 8px">
            @for (tag of tags(); track tag) {
              <tar-chip [label]="tag" [removable]="true" (removed)="remove(tag)" />
            } @empty {
              <span class="mat-body-medium">No tags on this contact.</span>
            }
          </div>
          <div><tar-button variant="text" (clicked)="reset()">Reset tags</tar-button></div>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          '`removable` adds a trailing `matChipRemove` button labelled "Remove {label}"; it emits `removed`. The parent owns the list and drops the tag.',
      },
    },
  },
};
