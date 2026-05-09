// traces_to: L2-106
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AvatarUser } from './initials';
import { TarAvatar, AvatarSize } from './tar-avatar';

@Component({
  selector: 'tar-avatar-uploader',
  imports: [TarAvatar],
  templateUrl: './tar-avatar-uploader.html',
  styleUrl: './tar-avatar-uploader.scss',
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
