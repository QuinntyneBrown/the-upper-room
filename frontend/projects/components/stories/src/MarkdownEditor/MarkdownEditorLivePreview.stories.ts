import { signal } from '@angular/core';
import type { StoryObj } from '@storybook/angular';

import type { TarMarkdownEditor } from 'components';

export const LivePreview: StoryObj<TarMarkdownEditor> = {
  render: () => {
    const value = signal(
      '# Toronto launch board\n\n**Goal:** open the first city hub by *September*.\n- Sign the lease\n- Hire a `city lead`',
    );
    return {
      props: { value, onChange: (v: string) => value.set(v) },
      template: `
        <div style="max-width: 640px; display: grid; gap: 12px">
          <tar-markdown-editor [value]="value()" (valueChange)="onChange($event)" />
          <pre style="margin: 0; padding: 12px; white-space: pre-wrap; font: var(--md-sys-typescale-body-small); background: var(--md-sys-color-surface-container); border-radius: var(--md-sys-shape-corner-small)">{{ value() }}</pre>
        </div>
      `,
    };
  },
  parameters: {
    docs: {
      description: {
        story:
          'The editor is controlled: it emits `valueChange` on every edit and toolbar action, and the parent feeds `value` back in (shown raw below). Switch to the Preview tab to see the rendered HTML — bold, italic, inline code, headings and list items.',
      },
    },
  },
};
