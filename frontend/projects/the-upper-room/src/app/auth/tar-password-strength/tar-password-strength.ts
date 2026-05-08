// traces_to: L2-019
import { Component, Input, computed, input, signal } from '@angular/core';
import { evaluatePassword } from '../password-policy';

@Component({
  selector: 'tar-password-strength',
  template: `
    <div class="bars" role="presentation">
      @for (i of barIndices; track i) {
        <span
          data-testid="password-strength-bar"
          class="bar"
          [class.bar--filled]="i < eval().score"
          [style.background]="i < eval().score ? barColor() : 'transparent'"
        ></span>
      }
    </div>
    <span data-testid="password-strength-label" class="label" [style.color]="labelColor()">
      {{ label() }}
    </span>
    @if (eval().helper; as msg) {
      <span data-testid="password-strength-helper" class="helper">{{ msg }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: grid;
        gap: var(--md-sys-space-1);
      }
      .bars {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: var(--md-sys-space-1);
      }
      .bar {
        height: 4px;
        border-radius: var(--md-sys-shape-corner-extra-small);
        background: var(--md-sys-color-surface-variant);
      }
      .label {
        font: var(--md-sys-typescale-body-small);
      }
      .helper {
        color: var(--md-sys-color-error);
        font: var(--md-sys-typescale-body-small);
      }
    `,
  ],
})
export class TarPasswordStrength {
  readonly password = input('');
  readonly userEmail = input('');

  protected readonly barIndices = [0, 1, 2, 3, 4];
  protected readonly eval = computed(() => evaluatePassword(this.password(), this.userEmail()));

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
