// traces_to: L2-031, L2-033
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TarAvatar } from '../../../../../components/src/lib/avatar/tar-avatar';
import { SnackbarService } from '../../../../../components/src/lib/snackbar/tar-snackbar.service';
import { ConfirmService } from '../../../../../components/src/lib/confirm-dialog/confirm.service';
import type { Contact } from '../contact-list/contact-list';

type Tab = 'overview' | 'notes' | 'activity';

@Component({
  selector: 'app-contact-detail',
  imports: [TarAvatar],
  templateUrl: './contact-detail.html',
  styleUrl: './contact-detail.scss',
})
export class ContactDetail implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly snackbar = inject(SnackbarService);
  private readonly confirm = inject(ConfirmService);

  private contactId = '';

  protected readonly contact = signal<Contact | null>(null);
  protected readonly activeTab = signal<Tab>('overview');

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id')!;
    this.http.get<Contact>(`/api/v1/contacts/${this.contactId}`).subscribe((c) => {
      this.contact.set(c);
      this.titleService.setTitle(`${c.name} · The Upper Room`);
    });
  }

  protected avatarUser(c: Contact) {
    return { displayName: c.name };
  }

  protected primaryPhone(c: Contact): string {
    return c.phones?.find((p) => p.primary)?.value ?? c.phones?.[0]?.value ?? '';
  }

  protected archive(): void {
    this.http
      .patch<Contact>(`/api/v1/contacts/${this.contactId}`, { archived: true })
      .subscribe((c) => {
        this.contact.set(c);
        this.snackbar.show('Contact archived', 'info', {
          label: 'Undo',
          onClick: () => {
            this.http.patch<Contact>(`/api/v1/contacts/${this.contactId}`, { archived: false }).subscribe((restored) => {
              this.contact.set(restored);
            });
          },
        });
      });
  }

  protected async deleteContact(): Promise<void> {
    const c = this.contact();
    if (!c) return;
    const ok = await this.confirm.confirm({
      severity: 'danger',
      title: 'Delete contact?',
      body: 'This will permanently remove the contact. Type the name to confirm.',
      requireTypedConfirmation: c.name,
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    this.http.delete(`/api/v1/contacts/${this.contactId}`).subscribe(() => {
      this.snackbar.show('Contact deleted', 'info');
      this.router.navigateByUrl('/contacts');
    });
  }
}
