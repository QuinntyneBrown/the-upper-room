import type { StoryObj } from '@storybook/angular';

import type { TarPasswordStrength } from 'components';

export const Levels: StoryObj<TarPasswordStrength> = {
  render: () => ({
    template: `
      <div style="max-width: 360px; display: grid; gap: 24px">
        <tar-password-strength password="" />
        <tar-password-strength password="kanban" />
        <tar-password-strength password="Kanban2026" />
        <tar-password-strength password="Kanban-Board-2026" />
      </div>
    `,
  }),
  parameters: {
    docs: {
      description: {
        story:
          'The score is the number of rules met (length 12–128, upper, lower, digit, symbol). Empty shows no label; 1–2 is **Weak** (error), 3–4 is **Okay** (secondary) and 5 is **Strong** (tertiary, no helper).',
      },
    },
  },
};
