// traces_to: L2-036
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ConfirmService, SnackbarService } from 'components';
import { LinkContactDialog } from '../link-contact-dialog/link-contact-dialog';

export interface LinkedContact {
  readonly id: string;
  readonly name: string;
  readonly cityId: string;
  readonly role?: string;
}

@Component({
  selector: 'app-partner-contacts-tab',
  imports: [LinkContactDialog],
  templateUrl: './partner-contacts-tab.html',
  styleUrl: './partner-contacts-tab.scss',
})
export class PartnerContactsTab implements OnInit {
  @Input({ required: true }) partnerId!: string;
  @Input() partnerName = '';

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly snackbar = inject(SnackbarService);

  protected readonly linked = signal<LinkedContact[]>([]);
  protected readonly showDialog = signal(false);

  ngOnInit(): void {
    this.loadLinked();
  }

  private loadLinked(): void {
    this.http
      .get<{ items: LinkedContact[]; total: number }>(`/api/v1/partners/${this.partnerId}/contacts`)
      .subscribe((r) => this.linked.set(r.items));
  }

  protected openLinkDialog(): void {
    this.showDialog.set(true);
  }

  protected onContactLinked(contact: LinkedContact): void {
    this.showDialog.set(false);
    this.loadLinked();
  }

  protected onDialogClosed(): void {
    this.showDialog.set(false);
  }

  protected async unlinkContact(contact: LinkedContact): Promise<void> {
    const ok = await this.confirm.confirm({
      title: 'Unlink contact?',
      body: `Remove ${contact.name} from ${this.partnerName}?`,
      confirmLabel: 'Unlink',
      cancelLabel: 'Cancel',
      severity: 'warning',
    });
    if (!ok) return;

    this.http.delete(`/api/v1/partners/${this.partnerId}/contacts/${contact.id}`).subscribe(() => {
      this.linked.update((list) => list.filter((c) => c.id !== contact.id));
      this.snackbar.show(`Contact unlinked from ${this.partnerName}`, 'info', {
        label: 'Undo',
        onClick: () => {
          this.http
            .post(`/api/v1/partners/${this.partnerId}/contacts`, { contactId: contact.id, role: contact.role ?? '' })
            .subscribe(() => this.loadLinked());
        },
      });
    });
  }

  protected goToContact(id: string): void {
    void this.router.navigateByUrl(`/contacts/${id}`);
  }
}
