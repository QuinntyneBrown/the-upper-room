// traces_to: L2-038
import { Page, Locator } from '@playwright/test';

export class TagsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> { await this.page.goto('/admin/tags'); }
  nameInput(): Locator { return this.page.getByTestId('tag-name'); }
  colorSelect(): Locator { return this.page.getByTestId('tag-color'); }
  createButton(): Locator { return this.page.getByTestId('tag-create'); }
  nameError(): Locator { return this.page.getByTestId('tag-error-name'); }
  group(color: string): Locator { return this.page.getByTestId(`tag-group-${color}`); }
  chip(id: string): Locator { return this.page.getByTestId(`tag-chip-${id}`); }
  editButton(id: string): Locator { return this.page.getByTestId(`tag-edit-${id}`); }
  deleteButton(id: string): Locator { return this.page.getByTestId(`tag-delete-${id}`); }
  editColorSelect(id: string): Locator { return this.page.getByTestId(`tag-edit-color-${id}`); }
  saveEditButton(id: string): Locator { return this.page.getByTestId(`tag-save-edit-${id}`); }
}
