// traces_to: L2-106
import { Component, Input, computed, signal } from '@angular/core';
import { AvatarUser, deterministicColor, initials } from './initials';

export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96;

@Component({
  selector: 'tar-avatar',
  template: `
    @if (avatarUrl()) {
      <img
        data-testid="avatar-image"
        class="avatar avatar--image"
        [style.width.px]="size"
        [style.height.px]="size"
        [src]="avatarUrl()"
        alt=""
      />
    } @else {
      <span
        data-testid="avatar-initials"
        class="avatar avatar--initials"
        [style.width.px]="size"
        [style.height.px]="size"
        [style.background]="background()"
        [style.fontSize.px]="size * 0.4"
      >
        {{ label() }}
      </span>
    }
  `,
  styles: [
    `
      .avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--md-sys-shape-corner-full);
        color: var(--md-sys-color-on-secondary-container);
        font-weight: 500;
        flex-shrink: 0;
      }
      .avatar--image {
        object-fit: cover;
      }
    `,
  ],
})
export class TarAvatar {
  @Input({ required: true }) user!: AvatarUser & { avatarUrl?: string | null };
  @Input() size: AvatarSize = 48;

  protected readonly avatarUrl = computed(() => this.user.avatarUrl ?? null);
  protected readonly label = computed(() => initials(this.user));
  protected readonly background = computed(() =>
    deterministicColor(this.user.email ?? this.user.displayName ?? 'anon'),
  );
}
