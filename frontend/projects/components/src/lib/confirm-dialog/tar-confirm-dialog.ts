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
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'tar-confirm-dialog',
  imports: [MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './tar-confirm-dialog.html',
  styleUrl: './tar-confirm-dialog.scss',
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
