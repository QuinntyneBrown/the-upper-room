using TheUpperRoom.Domain.Common;

namespace TheUpperRoom.Domain.Tags;

public sealed class Tag : CityScopedAuditableEntity
{
    public Tag(
        string cityId,
        string name,
        TagColor color,
        string? description,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Name = Guard.Required(name, nameof(Name), 50);
        Slug = SlugGenerator.From(Name);
        Color = color;
        Description = Guard.Optional(description, nameof(Description), 200);
    }

    public string Name { get; private set; }

    public string Slug { get; private set; }

    public TagColor Color { get; private set; }

    public string? Description { get; private set; }

    public void Update(string name, TagColor color, string? description, string updatedBy, DateTimeOffset updatedAt)
    {
        Name = Guard.Required(name, nameof(Name), 50);
        Slug = SlugGenerator.From(Name);
        Color = color;
        Description = Guard.Optional(description, nameof(Description), 200);
        Touch(updatedBy, updatedAt);
    }
}
