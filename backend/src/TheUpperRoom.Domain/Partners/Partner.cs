using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;

namespace TheUpperRoom.Domain.Partners;

public sealed class Partner : CityScopedAuditableEntity
{
    private readonly List<Address> _addresses = [];
    private readonly List<PhoneNumber> _phones = [];
    private readonly List<EmailAddress> _emails = [];
    private readonly List<SocialLink> _socialLinks = [];
    private readonly List<PartnerContactLink> _linkedContacts = [];
    private readonly List<string> _tagIds = [];

    public Partner(
        string cityId,
        string name,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Name = Guard.Required(name, nameof(Name), 200);
    }

    public string Name { get; private set; }

    public string? LegalName { get; private set; }

    public string? Website { get; private set; }

    public string? DescriptionMarkdown { get; private set; }

    public string? LogoUrl { get; private set; }

    public bool Archived { get; private set; }

    public DateTimeOffset? DeletedAt { get; private set; }

    public bool IsDeleted => DeletedAt is not null;

    public IReadOnlyCollection<Address> Addresses => _addresses.AsReadOnly();

    public IReadOnlyCollection<PhoneNumber> Phones => _phones.AsReadOnly();

    public IReadOnlyCollection<EmailAddress> Emails => _emails.AsReadOnly();

    public IReadOnlyCollection<SocialLink> SocialLinks => _socialLinks.AsReadOnly();

    public IReadOnlyCollection<PartnerContactLink> LinkedContacts => _linkedContacts.AsReadOnly();

    public IReadOnlyCollection<string> TagIds => _tagIds.AsReadOnly();

    public void UpdateBasics(
        string name,
        string? legalName,
        string? website,
        string? descriptionMarkdown,
        string? logoUrl,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        Name = Guard.Required(name, nameof(Name), 200);
        LegalName = Guard.Optional(legalName, nameof(LegalName), 200);
        Website = Guard.OptionalHttpUrl(website, nameof(Website));
        DescriptionMarkdown = Guard.Optional(descriptionMarkdown, nameof(DescriptionMarkdown), 2000);
        LogoUrl = Guard.OptionalHttpUrl(logoUrl, nameof(LogoUrl));
        Touch(updatedBy, updatedAt);
    }

    public void ReplaceAddresses(IEnumerable<Address> addresses, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        _addresses.Clear();
        _addresses.AddRange(addresses);
        Touch(updatedBy, updatedAt);
    }

    public void ReplacePhones(IEnumerable<PhoneNumber> phones, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        _phones.Clear();
        _phones.AddRange(phones);
        Touch(updatedBy, updatedAt);
    }

    public void ReplaceEmails(IEnumerable<EmailAddress> emails, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        _emails.Clear();
        _emails.AddRange(emails);
        Touch(updatedBy, updatedAt);
    }

    public void ReplaceSocialLinks(IEnumerable<SocialLink> socialLinks, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        _socialLinks.Clear();
        _socialLinks.AddRange(socialLinks);
        Touch(updatedBy, updatedAt);
    }

    public void ReplaceTags(IEnumerable<string> tagIds, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        _tagIds.Clear();
        _tagIds.AddRange(tagIds.Select(id => Guard.Id(id, "Tag id")).Distinct(StringComparer.OrdinalIgnoreCase));
        Touch(updatedBy, updatedAt);
    }

    public void LinkContact(string contactId, string role, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        var id = Guard.Id(contactId, nameof(contactId));
        if (_linkedContacts.Any(link => link.ContactId == id))
        {
            throw new DomainException("Contact is already linked to this partner.");
        }

        _linkedContacts.Add(new PartnerContactLink(id, role));
        Touch(updatedBy, updatedAt);
    }

    public void UnlinkContact(string contactId, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        var removed = _linkedContacts.RemoveAll(link => link.ContactId == contactId);
        if (removed > 0)
        {
            Touch(updatedBy, updatedAt);
        }
    }

    public void Archive(string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        if (Archived)
        {
            return;
        }

        Archived = true;
        Touch(updatedBy, updatedAt);
        Raise(new EntityArchivedDomainEvent(nameof(Partner), Id, updatedBy, updatedAt));
    }

    public void Restore(string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        if (!Archived)
        {
            return;
        }

        Archived = false;
        Touch(updatedBy, updatedAt);
        Raise(new EntityRestoredDomainEvent(nameof(Partner), Id, updatedBy, updatedAt));
    }

    public void SoftDelete(string updatedBy, DateTimeOffset deletedAt)
    {
        if (IsDeleted)
        {
            return;
        }

        DeletedAt = Guard.Utc(deletedAt, nameof(deletedAt));
        Archived = true;
        Name = "Deleted Partner";
        LegalName = null;
        Website = null;
        DescriptionMarkdown = null;
        LogoUrl = null;
        _addresses.Clear();
        _phones.Clear();
        _emails.Clear();
        _socialLinks.Clear();
        _linkedContacts.Clear();
        _tagIds.Clear();
        Touch(updatedBy, deletedAt);
        Raise(new EntityDeletedDomainEvent(nameof(Partner), Id, updatedBy, deletedAt));
    }

    private void EnsureNotDeleted()
    {
        if (IsDeleted)
        {
            throw new DomainException("Deleted partners cannot be changed.");
        }
    }
}
