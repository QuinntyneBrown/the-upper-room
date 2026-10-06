import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarFormActions } from 'components';

export const WithForm: StoryObj<TarFormActions> = {
  render: () => {
    const saved = signal('Spring food drive');
    const name = signal(saved());
    const saving = signal(false);
    return {
      props: {
        name,
        saved,
        saving,
        save: () => {
          saving.set(true);
          setTimeout(() => {
            saved.set(name());
            saving.set(false);
          }, 800);
        },
      },
      template: `
      <div style="max-width: 420px; display: grid; gap: 8px">
        <tar-text-field label="Board name" [value]="name()" (valueChange)="name.set($event)" />
        <tar-form-actions saveLabel="Rename board" saveType="button" [dirty]="name() !== saved()" [saving]="saving()" [disabled]="name().trim().length === 0" (saved)="save()" (cancelled)="name.set(saved())" />
        <span style="color: var(--md-sys-color-on-surface-variant)">Saved name: {{ saved() }}</span>
      </div>
    `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'Wired to signals: editing the name makes the form dirty, Cancel restores the saved value, and Save shows `saving` for a moment before committing.',
      },
    },
  },
};
