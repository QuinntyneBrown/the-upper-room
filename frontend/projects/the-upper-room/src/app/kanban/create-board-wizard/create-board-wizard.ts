// traces_to: L2-043, L2-044
import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TarButton, TarCheckbox, TarTextarea, TarTextField } from 'components';

export interface CreateBoardForm {
  readonly name: string;
  readonly description: string;
  readonly defaultColumns: boolean;
}

@Component({
  selector: 'app-create-board-wizard',
  imports: [MatDialogModule, TarButton, TarCheckbox, TarTextarea, TarTextField],
  templateUrl: './create-board-wizard.html',
  styleUrl: './create-board-wizard.scss',
  host: {
    'data-testid': 'create-board-wizard',
  },
})
export class CreateBoardWizard {
  private readonly ref = inject<MatDialogRef<CreateBoardWizard, CreateBoardForm>>(MatDialogRef);

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly defaultColumns = signal(true);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const name = this.name().trim();
    if (!name) return;
    this.ref.close({
      name,
      description: this.description().trim(),
      defaultColumns: this.defaultColumns(),
    });
  }

  protected onCancel(): void {
    this.ref.close();
  }
}
