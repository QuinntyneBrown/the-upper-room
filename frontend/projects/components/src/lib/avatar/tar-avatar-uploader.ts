// traces_to: L2-106
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarUser } from './initials';
import { TarAvatar, AvatarSize } from './tar-avatar';

@Component({
  selector: 'tar-avatar-uploader',
  imports: [TarAvatar],
  template: `
    <label class="uploader">
      <tar-avatar [user]="user" [size]="size" />
      <input
        data-testid="avatar-file-input"
        type="file"
        accept="image/*"
        class="uploader__input"
        (change)="onChange($any($event.target))"
      />
      <span class="uploader__cta">Change avatar</span>
    </label>
  `,
  styles: [
    `
      .uploader {
        display: inline-grid;
        gap: var(--md-sys-space-2);
        justify-items: center;
        cursor: pointer;
      }
      .uploader__input {
        display: none;
      }
      .uploader__cta {
        font: var(--md-sys-typescale-label-large);
        color: var(--md-sys-color-primary);
      }
    `,
  ],
})
export class TarAvatarUploader {
  @Input({ required: true }) user!: AvatarUser & { avatarUrl?: string | null };
  @Input() size: AvatarSize = 96;

  @Output() readonly fileSelected = new EventEmitter<File>();

  protected onChange(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (file) this.fileSelected.emit(file);
    input.value = '';
  }
}
