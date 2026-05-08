// traces_to: L2-046
import { Page, Locator } from '@playwright/test';

export class CardDetailDialog {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByTestId('card-detail-dialog');
  }

  title(): Locator {
    return this.page.getByTestId('card-detail-title');
  }

  schemaField(key: string): Locator {
    return this.page.getByTestId(`card-detail-field-${key}`);
  }

  fieldError(key: string): Locator {
    return this.page.getByTestId(`card-detail-field-error-${key}`);
  }

  commentsList(): Locator {
    return this.page.getByTestId('card-detail-comments');
  }

  commentInput(): Locator {
    return this.page.getByTestId('card-detail-comment-input');
  }

  addCommentButton(): Locator {
    return this.page.getByTestId('card-detail-comment-add');
  }

  attachmentsList(): Locator {
    return this.page.getByTestId('card-detail-attachments');
  }

  attachmentInput(): Locator {
    return this.page.getByTestId('card-detail-attachment-input');
  }

  closeButton(): Locator {
    return this.page.getByTestId('card-detail-close');
  }
}
