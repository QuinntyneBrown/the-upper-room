// traces_to: L2-036
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import type { LinkedContact } from '../partner-contacts-tab/partner-contacts-tab';

interface ContactSearchResult {
  readonly id: string;
  readonly name: string;
  readonly cityId: string;
}

@Component({
  selector: 'app-link-contact-dialog',
  imports: [],
  templateUrl: './link-contact-dialog.html',
  styleUrl: './link-contact-dialog.scss',
})
export class LinkContactDialog {
  @Input({ required: true }) partnerId!: string;
  @Output() linked = new EventEmitter<LinkedContact>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly http = inject(HttpClient);
  private readonly search$ = new Subject<string>();

  protected readonly query = signal('');
  protected readonly results = signal<ContactSearchResult[]>([]);
  protected readonly selected = signal<ContactSearchResult | null>(null);
  protected readonly role = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly submitting = signal(false);

  constructor() {
    this.search$
      .pipe(debounceTime(250), distinctUntilChanged())
      .subscribe((q) => {
        if (!q) { this.results.set([]); return; }
        this.http
          .get<{ items: ContactSearchResult[] }>(`/api/v1/contacts?search=${encodeURIComponent(q)}`)
          .subscribe((r) => this.results.set(r.items));
      });
  }

  protected onSearch(value: string): void {
    this.query.set(value);
    this.selected.set(null);
    this.search$.next(value);
  }

  protected selectContact(c: ContactSearchResult): void {
    this.selected.set(c);
    this.results.set([]);
    this.query.set(c.name);
  }

  protected confirm(): void {
    const contact = this.selected();
    if (!contact) return;
    this.error.set(null);
    this.submitting.set(true);

    this.http
      .post<{ contactId: string; role: string }>(`/api/v1/partners/${this.partnerId}/contacts`, {
        contactId: contact.id,
        role: this.role(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.linked.emit({ ...contact, role: this.role() });
        },
        error: (err) => {
          this.submitting.set(false);
          if (err.status === 409) {
            this.error.set(err.error?.error ?? 'Contact is already linked to this partner.');
          }
        },
      });
  }

  protected cancel(): void {
    this.cancelled.emit();
  }
}
