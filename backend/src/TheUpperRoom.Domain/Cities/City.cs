using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Cities;

public sealed class City : AuditableEntity
{
    public City(
        string name,
        string country,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(createdBy, createdAt, id)
    {
        Name = Guard.Required(name, nameof(Name), 100);
        Slug = SlugGenerator.From(Name);
        Country = Guard.Required(country, nameof(Country), 100);
    }

    public string Name { get; private set; }

    public string Slug { get; private set; }

    public string Country { get; private set; }

    public bool Archived { get; private set; }

    public void Rename(string name, string updatedBy, DateTimeOffset updatedAt)
    {
        Name = Guard.Required(name, nameof(Name), 100);
        Slug = SlugGenerator.From(Name);
        Touch(updatedBy, updatedAt);
    }

    public void Archive(string updatedBy, DateTimeOffset updatedAt)
    {
        if (Archived)
        {
            return;
        }

        Archived = true;
        Touch(updatedBy, updatedAt);
        Raise(new EntityArchivedDomainEvent(nameof(City), Id, updatedBy, updatedAt));
    }

    public void Restore(string updatedBy, DateTimeOffset updatedAt)
    {
        if (!Archived)
        {
            return;
        }

        Archived = false;
        Touch(updatedBy, updatedAt);
        Raise(new EntityRestoredDomainEvent(nameof(City), Id, updatedBy, updatedAt));
    }
}
