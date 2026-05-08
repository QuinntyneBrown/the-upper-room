using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;

namespace TheUpperRoom.Domain.Contacts;

public sealed class Contact : CityScopedAuditableEntity
{
    private readonly List<Address> _addresses = [];
    private readonly List<PhoneNumber> _phones = [];
    private readonly List<EmailAddress> _emails = [];
    private readonly List<string> _tagIds = [];

    public Contact(
        string cityId,
        string firstName,
        string lastName,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        FirstName = Guard.Required(firstName, nameof(FirstName), 100);
        LastName = Guard.Required(lastName, nameof(LastName), 100);
    }

    public string FirstName { get; private set; }

    public string LastName { get; private set; }

    public string? DisplayNameOverride { get; private set; }

    public string DisplayName => DisplayNameOverride ?? $"{FirstName} {LastName}";

    public string? Pronouns { get; private set; }

    public string? Title { get; private set; }

    public string? Organization { get; private set; }

    public string? OrganizationPartnerId { get; private set; }

    public string? AvatarUrl { get; private set; }

    public bool Archived { get; private set; }

    public DateTimeOffset? DeletedAt { get; private set; }

    public bool IsDeleted => DeletedAt is not null;

    public IReadOnlyCollection<Address> Addresses => _addresses.AsReadOnly();

    public IReadOnlyCollection<PhoneNumber> Phones => _phones.AsReadOnly();

    public IReadOnlyCollection<EmailAddress> Emails => _emails.AsReadOnly();

    public IReadOnlyCollection<string> TagIds => _tagIds.AsReadOnly();

    public void UpdatePersonalInfo(
        string firstName,
        string lastName,
        string? displayName,
        string? pronouns,
        string? title,
        string? organization,
        string? organizationPartnerId,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        FirstName = Guard.Required(firstName, nameof(FirstName), 100);
        LastName = Guard.Required(lastName, nameof(LastName), 100);
        DisplayNameOverride = Guard.Optional(displayName, nameof(DisplayNameOverride), 200);
        Pronouns = Guard.Optional(pronouns, nameof(Pronouns), 30);
        Title = Guard.Optional(title, nameof(Title), 100);
        Organization = Guard.Optional(organization, nameof(Organization), 200);
        OrganizationPartnerId = Guard.Optional(organizationPartnerId, nameof(OrganizationPartnerId), 100);
        Touch(updatedBy, updatedAt);
    }

    public void SetAvatar(string? avatarUrl, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        AvatarUrl = Guard.OptionalHttpUrl(avatarUrl, nameof(AvatarUrl));
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
        ReplacePrimaryAware(_phones, phones, "Only one primary phone is allowed.");
        Touch(updatedBy, updatedAt);
    }

    public void ReplaceEmails(IEnumerable<EmailAddress> emails, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        ReplacePrimaryAware(_emails, emails, "Only one primary email is allowed.");
        Touch(updatedBy, updatedAt);
    }

    public void ReplaceTags(IEnumerable<string> tagIds, string updatedBy, DateTimeOffset updatedAt)
    {
        EnsureNotDeleted();
        _tagIds.Clear();
        _tagIds.AddRange(NormalizeIds(tagIds));
        Touch(updatedBy, updatedAt);
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
        Raise(new EntityArchivedDomainEvent(nameof(Contact), Id, updatedBy, updatedAt));
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
        Raise(new EntityRestoredDomainEvent(nameof(Contact), Id, updatedBy, updatedAt));
    }

    public void SoftDelete(string updatedBy, DateTimeOffset deletedAt)
    {
        if (IsDeleted)
        {
            return;
        }

        DeletedAt = Guard.Utc(deletedAt, nameof(deletedAt));
        Archived = true;
        FirstName = "Deleted";
        LastName = "Contact";
        DisplayNameOverride = "Deleted Contact";
        Pronouns = null;
        Title = null;
        Organization = null;
        OrganizationPartnerId = null;
        AvatarUrl = null;
        _addresses.Clear();
        _phones.Clear();
        _emails.Clear();
        _tagIds.Clear();
        Touch(updatedBy, deletedAt);
        Raise(new EntityDeletedDomainEvent(nameof(Contact), Id, updatedBy, deletedAt));
    }

    private void EnsureNotDeleted()
    {
        if (IsDeleted)
        {
            throw new DomainException("Deleted contacts cannot be changed.");
        }
    }

    private static void ReplacePrimaryAware<T>(List<T> target, IEnumerable<T> values, string duplicateMessage)
    {
        var materialized = values.ToList();
        var primaryCount = materialized.Count(value =>
            value switch
            {
                PhoneNumber phone => phone.IsPrimary,
                EmailAddress email => email.IsPrimary,
                _ => false
            });

        if (primaryCount > 1)
        {
            throw new DomainException(duplicateMessage);
        }

        target.Clear();
        target.AddRange(materialized);
    }

    private static IEnumerable<string> NormalizeIds(IEnumerable<string> ids) =>
        ids.Select(id => Guard.Id(id, "Tag id")).Distinct(StringComparer.OrdinalIgnoreCase);
}
