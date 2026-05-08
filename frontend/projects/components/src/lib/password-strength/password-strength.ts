import { Component, computed, input } from '@angular/core';
import { evaluatePassword, PasswordEvaluator } from './password-policy';

@Component({
  selector: 'tar-password-strength',
  templateUrl: './password-strength.html',
  styleUrl: './password-strength.scss',
})
export class TarPasswordStrength {
  readonly password = input('');
  readonly userEmail = input('');
  readonly evaluator = input<PasswordEvaluator>(evaluatePassword);

  protected readonly barIndices = [0, 1, 2, 3, 4];
  protected readonly eval = computed(() => this.evaluator()(this.password(), this.userEmail()));

  protected readonly label = computed(() => {
    const s = this.eval().score;
    if (s === 5) return 'Strong';
    if (s >= 3) return 'Okay';
    if (s >= 1) return 'Weak';
    return '';
  });

  protected readonly barColor = computed(() => {
    const s = this.eval().score;
    if (s === 5) return 'var(--md-sys-color-tertiary)';
    if (s >= 3) return 'var(--md-sys-color-secondary)';
    return 'var(--md-sys-color-error)';
  });

  protected readonly labelColor = computed(() => this.barColor());
}
