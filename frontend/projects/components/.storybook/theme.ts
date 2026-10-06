import { create } from 'storybook/theming';

/**
 * Brands the Storybook manager with The Upper Room's Material 3 palette.
 * The manager runs outside the preview iframe, so it cannot read the
 * `--md-sys-*` custom properties; these are the light-scheme values of the
 * roles named alongside each one in `src/lib/tokens/_tokens.scss`. Keep
 * them in step when the seed colour changes.
 * See https://storybook.js.org/docs/configure/user-interface/theming
 */
const sys = {
  primary: '#6750a4', // --md-sys-color-primary
  onPrimary: '#ffffff', // --md-sys-color-on-primary
  onSurface: '#1c1b1f', // --md-sys-color-on-surface
  onSurfaceVariant: '#49454f', // --md-sys-color-on-surface-variant
  outline: '#79747e', // --md-sys-color-outline
  outlineVariant: '#cac4d0', // --md-sys-color-outline-variant
  surface: '#fffbfe', // --md-sys-color-surface
  surfaceContainerLow: '#f7f2fa', // --md-sys-color-surface-container-low
  cornerSmall: 8, // --md-sys-shape-corner-small
  cornerMedium: 12, // --md-sys-shape-corner-medium
};

const theme = create({
  base: 'light',

  colorPrimary: sys.primary,
  colorSecondary: sys.primary,

  // UI
  appBg: sys.surfaceContainerLow,
  appContentBg: sys.surface,
  appPreviewBg: sys.surface,
  appBorderColor: sys.outlineVariant,
  appBorderRadius: sys.cornerMedium,

  // Fonts
  fontBase: "'Roboto', system-ui, sans-serif",
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',

  // Text colors
  textColor: sys.onSurface,
  textMutedColor: sys.onSurfaceVariant,
  textInverseColor: sys.onPrimary,

  // Toolbar default and active colors
  barTextColor: sys.onSurfaceVariant,
  barSelectedColor: sys.primary,
  barHoverColor: sys.primary,
  barBg: sys.surface,

  // Form colors
  inputBg: sys.surface,
  inputBorder: sys.outline,
  inputTextColor: sys.onSurface,
  inputBorderRadius: sys.cornerSmall,

  brandTitle: 'The Upper Room Design System',
  brandUrl: 'https://github.com/QuinntyneBrown/the-upper-room',
  brandImage: './the-upper-room-wordmark.svg',
  brandTarget: '_self',
});

export default theme;
