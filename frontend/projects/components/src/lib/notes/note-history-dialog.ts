// traces_to: L2-041, L2-042
import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import type { NoteDto } from './tar-notes';

export interface NoteHistoryDialogData {
  readonly note: NoteDto;
}

@Component({
  selector: 'tar-note-history-dialog',
  imports: [MatDialogModule],
  templateUrl: './note-history-dialog.html',
  styleUrl: './tar-notes.scss',
  host: {
    'data-testid': 'note-history-dialog',
  },
})
export class NoteHistoryDialog {
  protected readonly data = inject<NoteHistoryDialogData>(MAT_DIALOG_DATA);
  protected readonly previewHtml = signal<string>(this.data.note.bodyHtmlSanitized);

  protected selectVersion(html: string): void {
    this.previewHtml.set(html);
  }

  protected relativeTime(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffDays = diffMs / 86_400_000;
    if (diffDays > 7)
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    const diffMins = diffMs / 60_000;
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${Math.floor(diffMins)} min ago`;
    const diffHours = diffMs / 3_600_000;
    if (diffHours < 24) return `${Math.floor(diffHours)} h ago`;
    return `${Math.floor(diffDays)} d ago`;
  }
}
