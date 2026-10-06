// traces_to: L2-041
import { Page, Locator } from '@playwright/test';
import { NotesTab } from './NotesTab';

export class NoteHistoryDialog {
  private readonly notes: NotesTab;

  constructor(private readonly page: Page) {
    this.notes = new NotesTab(page);
  }

  historyButton(noteIndex: number): Locator {
    return this.notes.note(noteIndex).getByTestId('note-history-button');
  }

  dialog(): Locator { return this.page.getByTestId('note-history-dialog'); }
  versionItem(index: number): Locator { return this.dialog().getByTestId('note-history-version').nth(index); }
  versionTimestamp(index: number): Locator { return this.versionItem(index).getByTestId('note-history-version-time'); }
  preview(): Locator { return this.dialog().getByTestId('note-history-preview'); }
  closeButton(): Locator { return this.dialog().getByTestId('note-history-close'); }
}
