// traces_to: L2-106
import { Component, Input, computed, signal } from '@angular/core';
import { AvatarUser, deterministicColor, initials } from './initials';

export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96;

@Component({
  selector: 'tar-avatar',
  templateUrl: './tar-avatar.html',
  styleUrl: './tar-avatar.scss',
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
