/*
 * Public API Surface of components
 *
 * Reusable presentational components for the-upper-room web app. Every
 * component is built as a thin wrapper over an Angular Material primitive,
 * uses BEM class names, and reads spacing/colors/typography from the
 * design tokens defined in `lib/tokens/_tokens.scss`.
 */

export * from './lib/components';

// Root providers
export * from './lib/provide-tar-components';

// Foundation
export * from './lib/icon/icon';
export * from './lib/icon/icon-aliases';

// Form primitives
export * from './lib/button/button';
export * from './lib/icon-button/icon-button';
export * from './lib/fab/fab';
export * from './lib/text-field/text-field';
export * from './lib/password-field/password-field';
export * from './lib/textarea/textarea';
export * from './lib/select/select';
export * from './lib/checkbox/checkbox';
export * from './lib/radio-group/radio-group';
export * from './lib/toggle/toggle';
export * from './lib/form-actions/form-actions';
export * from './lib/search-field/search-field';

// Layout & navigation
export * from './lib/card/card';
export * from './lib/divider/divider';
export * from './lib/list/list';
export * from './lib/list/list-item';
export * from './lib/page-header/page-header';
export * from './lib/banner/banner';
export * from './lib/toolbar/toolbar';
export * from './lib/side-nav/side-nav';
export * from './lib/nav-item/nav-item';
export * from './lib/drawer/drawer';
export * from './lib/tabs/tabs';

// Indicators & overlays
export * from './lib/progress-bar/progress-bar';
export * from './lib/progress-spinner/progress-spinner';
export * from './lib/chip/chip';
export * from './lib/chip/chip-set';
export * from './lib/badge/badge';
export * from './lib/tooltip/tooltip';
export * from './lib/menu/menu';
export * from './lib/dialog/dialog';
export * from './lib/pagination/pagination';

// Feedback
export * from './lib/snackbar/tar-snackbar';
export * from './lib/snackbar/tar-snackbar.service';
export * from './lib/confirm-dialog/tar-confirm-dialog';
export * from './lib/confirm-dialog/confirm.service';

// States
export * from './lib/states/tar-empty-state';
export * from './lib/states/tar-list-error';
export * from './lib/states/tar-skeleton';

// Specialized
export * from './lib/password-strength/password-strength';
export * from './lib/password-strength/password-policy';
export * from './lib/avatar/tar-avatar';
export * from './lib/avatar/tar-avatar-uploader';
export * from './lib/avatar/initials';

// Formatting
export * from './lib/relative-time/relative-time';

// Utilities
export * from './lib/optimistic-mutation/optimistic-mutation';
export * from './lib/share-button/share-button';

// Notes
export * from './lib/notes/tar-notes';

// Markdown editor
export * from './lib/markdown-editor/tar-markdown-editor';

// Network
export * from './lib/network/network.service';
export * from './lib/network/offline-banner/offline-banner';

// i18n
export * from './lib/i18n/translate.token';
export * from './lib/i18n/translate.service';
export * from './lib/i18n/transloco.pipe';

// Breadcrumb
export * from './lib/breadcrumb/breadcrumb.service';

// HTTP Interceptors
export * from './lib/interceptors/retry.interceptor';
