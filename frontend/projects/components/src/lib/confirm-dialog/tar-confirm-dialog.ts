// traces_to: L2-099
import {
  AfterViewChecked,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'tar-confirm-dialog',
  template: `
    @if (svc.current(); as req) {
      <div class="backdrop" (click)="svc.resolve(false)"></div>
      <div
        data-testid="confirm-dialog"
        class="dialog"
        role="dialog"
        aria-modal="true"
        [attr.data-severity]="req.severity ?? 'info'"
        (click)="$event.stopPropagation()"
      >
        <h2 data-testid="confirm-title" class="dialog__title">{{ req.title }}</h2>
        @if (req.body) {
          <p data-testid="confirm-body" class="dialog__body">{{ req.body }}</p>
        }
        @if (req.requireTypedConfirmation; as phrase) {
          <input
            data-testid="confirm-typed-input"
            class="dialog__input"
            type="text"
            [placeholder]="'Type ' + phrase + ' to confirm'"
            [value]="typed()"
            (input)="typed.set($any($event.target).value)"
          />
        }
        <div class="dialog__actions">
          <button
            #cancel
            data-testid="confirm-cancel"
            type="button"
            class="dialog__btn dialog__btn--cancel"
            (click)="svc.resolve(false)"
          >
            {{ req.cancelLabel ?? 'Cancel' }}
          </button>
          <button
            data-testid="confirm-button"
            type="button"
            class="dialog__btn dialog__btn--confirm"
            [disabled]="!confirmEnabled()"
            (click)="svc.resolve(true)"
          >
            {{ req.confirmLabel ?? 'Confirm' }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.32);
        z-index: 60;
      }

      .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--md-sys-color-surface-container-high);
        color: var(--md-sys-color-on-surface);
        padding: var(--md-sys-space-6);
        border-radius: var(--md-sys-shape-corner-extra-large);
        box-shadow: var(--md-sys-elevation-level-3);
        min-width: 280px;
        max-width: 560px;
        z-index: 70;
        display: grid;
        gap: var(--md-sys-space-4);
      }

      .dialog[data-severity='warning'] {
        background: var(--md-sys-color-tertiary-container);
        color: var(--md-sys-color-on-tertiary-container);
      }

      .dialog[data-severity='danger'] {
        background: var(--md-sys-color-error-container);
        color: var(--md-sys-color-on-error-container);
      }

      .dialog__title {
        margin: 0;
        font: var(--md-sys-typescale-headline-small);
      }

      .dialog__body {
        margin: 0;
      }

      .dialog__input {
        padding: var(--md-sys-space-2) var(--md-sys-space-3);
        border-radius: var(--md-sys-shape-corner-extra-small);
        border: 1px solid var(--md-sys-color-outline);
        font: var(--md-sys-typescale-body-medium);
      }

      .dialog__actions {
        display: flex;
        gap: var(--md-sys-space-2);
        justify-content: flex-end;
      }

      .dialog__btn {
        border: 0;
        border-radius: var(--md-sys-shape-corner-full);
        padding: var(--md-sys-space-2) var(--md-sys-space-6);
        font: var(--md-sys-typescale-label-large);
        cursor: pointer;
      }

      .dialog__btn--cancel {
        background: transparent;
        color: inherit;
      }

      .dialog__btn--confirm {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
      }

      .dialog__btn--confirm:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ],
})
export class TarConfirmDialog implements AfterViewChecked {
  protected readonly svc = inject(ConfirmService);
  protected readonly typed = signal('');
  protected readonly cancel = viewChild<ElementRef<HTMLButtonElement>>('cancel');

  protected readonly confirmEnabled = computed(() => {
    const req = this.svc.current();
    if (!req) return false;
    if (!req.requireTypedConfirmation) return true;
    return this.typed() === req.requireTypedConfirmation;
  });

  private focused = false;

  ngAfterViewChecked(): void {
    const req = this.svc.current();
    if (!req) {
      this.focused = false;
      this.typed.set('');
      return;
    }
    if (!this.focused) {
      this.cancel()?.nativeElement.focus();
      this.focused = true;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.svc.resolve(false);
  }
}
