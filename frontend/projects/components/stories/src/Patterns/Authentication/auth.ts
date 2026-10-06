/**
 * The signed-out frame: no toolbar or drawer, one outlined `tar-card` centred
 * on a `surface-container-low` page, max 420px wide.
 */
export const authPage = (card: string): string => `
  <main style="min-height: 100vh; box-sizing: border-box; display: grid; place-items: center; padding: var(--md-sys-space-8) var(--md-sys-space-4); background: var(--md-sys-color-surface-container-low)">
    <div style="width: 100%; max-width: 420px; display: grid; gap: var(--md-sys-space-6); justify-items: center">
      <span style="font: var(--md-sys-typescale-title-large); color: var(--md-sys-color-primary)">The Upper Room</span>
      <tar-card appearance="outlined" style="width: 100%">
        ${card}
      </tar-card>
    </div>
  </main>
`;

export const AUTH_TITLE =
  'margin: 0; font: var(--md-sys-typescale-headline-small); color: var(--md-sys-color-on-surface)';
export const AUTH_FORM =
  'display: grid; gap: var(--md-sys-space-4); padding-block: var(--md-sys-space-2)';
export const AUTH_TEXT =
  'margin: 0; font: var(--md-sys-typescale-body-medium); color: var(--md-sys-color-on-surface-variant)';
export const AUTH_LINKS =
  'display: flex; justify-content: space-between; gap: var(--md-sys-space-3); font: var(--md-sys-typescale-label-large)';
export const AUTH_LINK = 'color: var(--md-sys-color-primary)';
