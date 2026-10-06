import { Component, Input, afterNextRender, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';

import {
  ConfirmService,
  TarButton,
  TarFormActions,
  TarList,
  TarListItem,
  TarPageHeader,
  TarSearchField,
  TarTextField,
  type ConfirmOptions,
} from 'components';

interface PartnerContact {
  readonly id: string;
  readonly name: string;
  readonly org: string;
}

const DIRECTORY: readonly PartnerContact[] = [
  { id: 'c1', name: 'Ama Mensah', org: 'Daily Bread Food Bank' },
  { id: 'c8', name: 'Amara Okafor', org: 'Scadding Court Community Centre' },
  { id: 'c9', name: 'Amir Haddad', org: 'Newcomer Hub' },
  { id: 'c2', name: 'Jordan Lee', org: 'Kensington Community Kitchen' },
];

export interface LinkContactData {
  readonly partner: string;
  readonly query: string;
}

/**
 * Story-local form dialog, composed like the app's `LinkContactDialog`: Material
 * dialog layout directives around library fields and `tar-form-actions`.
 */
@Component({
  selector: 'story-link-contact-dialog',
  imports: [MatDialogModule, TarSearchField, TarList, TarListItem, TarTextField, TarFormActions],
  host: { 'data-testid': 'link-contact-dialog' },
  templateUrl: './link-contact-dialog.html',
})
export class StoryLinkContactDialog {
  protected readonly data = inject<LinkContactData>(MAT_DIALOG_DATA);
  protected readonly ref =
    inject<MatDialogRef<StoryLinkContactDialog, PartnerContact>>(MatDialogRef);
  protected readonly query = signal(this.data.query);
  protected readonly selected = signal<PartnerContact | null>(null);
  protected readonly role = signal('');
  protected readonly results = signal(this.filter(this.data.query));

  protected search(value: string): void {
    this.query.set(value);
    this.selected.set(null);
    this.results.set(this.filter(value));
  }

  protected select(contact: PartnerContact): void {
    this.selected.set(contact);
    this.query.set(contact.name);
  }

  private filter(q: string): PartnerContact[] {
    const term = q.trim().toLowerCase();
    return term ? DIRECTORY.filter((c) => c.name.toLowerCase().includes(term)) : [];
  }
}

/**
 * A page behind the dialog plus the button that opens it. Opens once on first
 * render so the story shows the real overlay (backdrop, focus trap, Escape);
 * close it and press the button to open it again.
 */
@Component({
  selector: 'story-dialog-stage',
  imports: [TarButton, TarPageHeader],
  templateUrl: './dialog-stage.html',
})
export class StoryDialogStage {
  @Input() eyebrow: string | null = null;
  @Input() pageTitle = '';
  @Input() subtitle: string | null = null;
  @Input() triggerLabel = 'Open';
  @Input() triggerIcon: string | null = null;
  @Input() triggerVariant: 'filled' | 'outlined' | 'text' = 'outlined';
  /** Opens `tar-confirm-dialog` through `ConfirmService` with these options… */
  @Input() confirm: ConfirmOptions | null = null;
  /** …or the story-local link-contact form dialog with this data. */
  @Input() linkContact: LinkContactData | null = null;

  private readonly confirmService = inject(ConfirmService);
  private readonly dialog = inject(MatDialog);
  protected readonly result = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.open());
  }

  protected async open(): Promise<void> {
    if (this.confirm) {
      const ok = await this.confirmService.confirm(this.confirm);
      this.result.set(ok ? 'confirmed' : 'cancelled');
    } else if (this.linkContact) {
      this.dialog
        .open<StoryLinkContactDialog, LinkContactData, PartnerContact>(StoryLinkContactDialog, {
          data: this.linkContact,
          width: '520px',
          maxWidth: 'calc(100vw - 32px)',
          autoFocus: '[data-testid="link-contact-search"]',
          restoreFocus: true,
        })
        .afterClosed()
        .subscribe((c) => this.result.set(c ? `linked ${c.name}` : 'cancelled'));
    }
  }
}
