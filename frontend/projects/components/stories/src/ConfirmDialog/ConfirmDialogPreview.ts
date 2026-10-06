import { NgComponentOutlet } from '@angular/common';
import {
  Component,
  Injector,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { TarConfirmDialog, type ConfirmOptions } from 'components';

/**
 * Story-only host: renders `tar-confirm-dialog` inline (no overlay) with the
 * given options as `MAT_DIALOG_DATA` and a stub `MatDialogRef` that records the
 * result instead of closing anything.
 */
@Component({
  selector: 'story-confirm-dialog-preview',
  imports: [NgComponentOutlet],
  // The dialog container's own stylesheet (title/content/actions padding) only
  // loads when MatDialog opens a dialog, so the inline preview re-creates the
  // M3 dialog surface and paddings here.
  encapsulation: ViewEncapsulation.None,
  styleUrl: './ConfirmDialogPreview.scss',
  templateUrl: './ConfirmDialogPreview.html',
})
export class ConfirmDialogPreview {
  readonly options = input.required<ConfirmOptions>();

  protected readonly dialog = TarConfirmDialog;
  protected readonly result = signal<boolean | null>(null);

  private readonly parent = inject(Injector);

  protected readonly injector = computed(() =>
    Injector.create({
      parent: this.parent,
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: this.options() },
        {
          provide: MatDialogRef,
          useValue: { close: (value: boolean) => this.result.set(value) },
        },
      ],
    }),
  );
}
