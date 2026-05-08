// traces_to: L2-031
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { TarAvatar } from '../../../../../components/src/lib/avatar/tar-avatar';
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
  private readonly titleService = inject(Title);

  protected readonly contact = signal<Contact | null>(null);
  protected readonly activeTab = signal<Tab>('overview');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.http.get<Contact>(`/api/v1/contacts/${id}`).subscribe((c) => {
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
}
