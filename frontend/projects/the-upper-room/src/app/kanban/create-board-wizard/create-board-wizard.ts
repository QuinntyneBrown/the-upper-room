// traces_to: L2-043, L2-044
import { Component, EventEmitter, Output, signal } from '@angular/core';

export interface CreateBoardForm {
  readonly name: string;
  readonly description: string;
  readonly defaultColumns: boolean;
}

@Component({
  selector: 'app-create-board-wizard',
  templateUrl: './create-board-wizard.html',
  styleUrl: './create-board-wizard.scss',
})
export class CreateBoardWizard {
  @Output() submitted = new EventEmitter<CreateBoardForm>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly name = signal('');
  protected readonly description = signal('');
  protected readonly defaultColumns = signal(true);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.name().trim()) return;
    this.submitted.emit({
      name: this.name().trim(),
      description: this.description().trim(),
      defaultColumns: this.defaultColumns(),
    });
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }
}
