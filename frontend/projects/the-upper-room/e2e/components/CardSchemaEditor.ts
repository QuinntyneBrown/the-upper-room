// traces_to: L2-047
import { Page, Locator } from '@playwright/test';

export class CardSchemaEditor {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('card-schema-editor');
  }

  fieldRows(): Locator {
    return this.page.locator('[data-testid^="schema-field-"][data-field-key]');
  }

  field(index: number): Locator {
    return this.page.getByTestId(`schema-field-${index}`);
  }

  addFieldButton(): Locator {
    return this.page.getByTestId('schema-add-field');
  }

  saveButton(): Locator {
    return this.page.getByTestId('board-configure-save');
  }

  fieldKeyInput(index: number): Locator {
    return this.page.getByTestId(`schema-field-key-${index}`);
  }

  fieldLabelInput(index: number): Locator {
    return this.page.getByTestId(`schema-field-label-${index}`);
  }

  fieldTypeSelect(index: number): Locator {
    return this.page.getByTestId(`schema-field-type-${index}`);
  }

  fieldRequiredCheckbox(index: number): Locator {
    return this.page.getByTestId(`schema-field-required-${index}`).locator('input[type="checkbox"]');
  }

  removeFieldButton(index: number): Locator {
    return this.page.getByTestId(`schema-field-remove-${index}`);
  }

  moveDownButton(index: number): Locator {
    return this.page.getByTestId(`schema-field-down-${index}`);
  }

  moveUpButton(index: number): Locator {
    return this.page.getByTestId(`schema-field-up-${index}`);
  }

  addOptionButton(fieldIndex: number): Locator {
    return this.page.getByTestId(`schema-field-add-option-${fieldIndex}`);
  }

  optionInput(fieldIndex: number, optionIndex: number): Locator {
    return this.page.getByTestId(`schema-field-option-${fieldIndex}-${optionIndex}`);
  }

  /**
   * Selects a value from the Material select for a given field's type. Opens
   * the dropdown and clicks the option matching `type`.
   */
  /**
   * Open the `mat-select`, click the matching option, close.
   *
   * We click the inner `.mat-mdc-select-trigger` because the host
   * `<mat-select>` does not respond to synthetic clicks under the
   * test runner. After picking the option we wait for the overlay to
   * tear down so the next interaction isn't shadowed by leftover
   * `mat-option` nodes.
   */
  async chooseType(fieldIndex: number, type: string): Promise<void> {
    const trigger = this.fieldTypeSelect(fieldIndex).locator('.mat-mdc-select-trigger');
    await trigger.click();
    const option = this.page.getByRole('option', { name: type, exact: true });
    await option.waitFor({ state: 'visible' });
    await option.click();
    await this.page.locator('mat-option').first().waitFor({ state: 'hidden' });
  }
}
