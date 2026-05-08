// traces_to: L2-042
import { Page, Locator } from '@playwright/test';

export class NotesTab {
  constructor(private readonly page: Page) {}

  composer(): Locator { return this.page.getByTestId('notes-composer'); }
  submitButton(): Locator { return this.page.getByTestId('notes-submit'); }
  composerError(): Locator { return this.page.getByTestId('notes-composer-error'); }
  note(index: number): Locator { return this.page.getByTestId('notes-item').nth(index); }
  noteBody(index: number): Locator { return this.note(index).getByTestId('note-body'); }
  noteAuthor(index: number): Locator { return this.note(index).getByTestId('note-author'); }
  noteTime(index: number): Locator { return this.note(index).getByTestId('note-time'); }
  noteEditButton(index: number): Locator { return this.note(index).getByTestId('note-edit-button'); }
  noteDeleteButton(index: number): Locator { return this.note(index).getByTestId('note-delete-button'); }
  noteEditForm(index: number): Locator { return this.note(index).getByTestId('note-edit-form'); }
  noteEditInput(index: number): Locator { return this.note(index).getByTestId('note-edit-input'); }
  noteSaveButton(index: number): Locator { return this.note(index).getByTestId('note-save-button'); }
}
