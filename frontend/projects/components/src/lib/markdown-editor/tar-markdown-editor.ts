// traces_to: L2-050, L2-051
import { Component, ViewChild, ElementRef, computed, signal, inject, input, output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../snackbar/tar-snackbar.service';

type Tab = 'write' | 'preview';

@Component({
  selector: 'tar-markdown-editor',
  imports: [],
  templateUrl: './tar-markdown-editor.html',
  styleUrl: './tar-markdown-editor.scss',
})
export class TarMarkdownEditor {
  private readonly http = inject(HttpClient);
  private readonly snackbar = inject(SnackbarService);

  readonly value = input('');
  readonly maxLength = input(10000);
  readonly uploadUrl = input('/api/v1/uploads');
  readonly maxUploadBytes = input(10 * 1024 * 1024);

  readonly valueChange = output<string>();

  @ViewChild('textareaEl') private readonly textareaEl?: ElementRef<HTMLTextAreaElement>;

  protected readonly activeTab = signal<Tab>('write');
  protected readonly charCount = computed(() => this.value().length);
  protected readonly isAtLimit = computed(() => this.charCount() >= this.maxLength());
  protected readonly previewHtml = computed(() => this.renderMarkdown(this.value()));

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }

  protected applyBold(): void { this.wrapSelection('**', '**'); }
  protected applyItalic(): void { this.wrapSelection('*', '*'); }
  protected applyCode(): void { this.wrapSelection('`', '`'); }
  protected applyLink(): void { this.wrapSelection('[', '](url)'); }

  protected applyHeading(): void {
    const el = this.textareaEl?.nativeElement;
    if (!el) return;
    const start = el.selectionStart;
    const newVal = this.value().slice(0, start) + '## ' + this.value().slice(start);
    el.value = newVal;
    this.valueChange.emit(newVal);
    el.focus();
  }

  protected applyList(): void {
    const el = this.textareaEl?.nativeElement;
    if (!el) return;
    const start = el.selectionStart;
    const newVal = this.value().slice(0, start) + '- ' + this.value().slice(start);
    el.value = newVal;
    this.valueChange.emit(newVal);
    el.focus();
  }

  protected onImageFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (file.size > this.maxUploadBytes()) {
      this.snackbar.show('Image is too large (max 10MB). Try a smaller image.', 'error');
      return;
    }

    const form = new FormData();
    form.append('file', file);
    this.http.post<{ url: string }>(this.uploadUrl(), form).subscribe((res) => {
      this.insertText(`![${file.name}](${res.url})`);
    });
  }

  private wrapSelection(before: string, after: string): void {
    const el = this.textareaEl?.nativeElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const current = this.value();
    const newVal = current.slice(0, start) + before + current.slice(start, end) + after + current.slice(end);
    el.value = newVal;
    this.valueChange.emit(newVal);
    el.focus();
  }

  private insertText(text: string): void {
    const el = this.textareaEl?.nativeElement;
    if (!el) return;
    const start = el.selectionStart;
    const current = this.value();
    const newVal = current.slice(0, start) + text + current.slice(start);
    el.value = newVal;
    this.valueChange.emit(newVal);
    el.focus();
  }

  private renderMarkdown(md: string): string {
    return md
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }
}
