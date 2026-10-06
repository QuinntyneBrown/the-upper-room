// traces_to: L2-106
import { Component, computed, input } from '@angular/core';
import { AvatarUser, deterministicColor, initials } from './initials';

export type AvatarSize = 24 | 32 | 40 | 48 | 64 | 96;

@Component({
  selector: 'tar-avatar',
  templateUrl: './tar-avatar.html',
  styleUrl: './tar-avatar.scss',
})
export class TarAvatar {
  readonly user = input.required<AvatarUser & { avatarUrl?: string | null }>();
  readonly size = input<AvatarSize>(48);

  protected readonly avatarUrl = computed(() => this.user().avatarUrl ?? null);
  protected readonly label = computed(() => initials(this.user()));
  protected readonly background = computed(() => {
    const u = this.user();
    return deterministicColor(u.email ?? u.displayName ?? 'anon');
  });
}
