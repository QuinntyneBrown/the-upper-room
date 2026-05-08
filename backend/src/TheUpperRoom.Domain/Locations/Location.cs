using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Common.ValueObjects;

namespace TheUpperRoom.Domain.Locations;

public sealed class Location : CityScopedAuditableEntity
{
    private readonly List<string> _photoUrls = [];
    private readonly List<string> _tagIds = [];

    private Location() : base(string.Empty, "ef", DateTimeOffset.UnixEpoch)
    {
        Name = string.Empty;
        Address = null!;
    }

    public Location(
        string cityId,
        string name,
        Address address,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(cityId, createdBy, createdAt, id)
    {
        Name = Guard.Required(name, nameof(Name), 200);
        Address = address;
    }

    public string Name { get; private set; }

    public Address Address { get; private set; }

    public int? Capacity { get; private set; }

    public string? AccessibilityNotes { get; private set; }

    public string? ParkingNotes { get; private set; }

    public bool Archived { get; private set; }

    public IReadOnlyCollection<string> PhotoUrls => _photoUrls.AsReadOnly();

    public IReadOnlyCollection<string> TagIds => _tagIds.AsReadOnly();

    public void Update(
        string name,
        Address address,
        int? capacity,
        string? accessibilityNotes,
        string? parkingNotes,
        IEnumerable<string> photoUrls,
        IEnumerable<string> tagIds,
        string updatedBy,
        DateTimeOffset updatedAt)
    {
        Name = Guard.Required(name, nameof(Name), 200);
        Address = address;
        Capacity = Guard.OptionalRange(capacity, nameof(Capacity), 1, 10000);
        AccessibilityNotes = Guard.Optional(accessibilityNotes, nameof(AccessibilityNotes), 1000);
        ParkingNotes = Guard.Optional(parkingNotes, nameof(ParkingNotes), 500);
        ReplacePhotoUrls(photoUrls);
        ReplaceIds(_tagIds, tagIds, "Tag id");
        Touch(updatedBy, updatedAt);
    }

    public void EnsureCanDelete(int upcomingScheduledEventCount)
    {
        if (upcomingScheduledEventCount > 0)
        {
            throw new DomainException($"This location is used by {upcomingScheduledEventCount} upcoming events. Archive it instead.");
        }
    }

    public void Archive(string updatedBy, DateTimeOffset updatedAt)
    {
        if (Archived)
        {
            return;
        }

        Archived = true;
        Touch(updatedBy, updatedAt);
        Raise(new EntityArchivedDomainEvent(nameof(Location), Id, updatedBy, updatedAt));
    }

    public void Restore(string updatedBy, DateTimeOffset updatedAt)
    {
        if (!Archived)
        {
            return;
        }

        Archived = false;
        Touch(updatedBy, updatedAt);
        Raise(new EntityRestoredDomainEvent(nameof(Location), Id, updatedBy, updatedAt));
    }

    private void ReplacePhotoUrls(IEnumerable<string> photoUrls)
    {
        var materialized = photoUrls.Select(url => Guard.RequiredHttpUrl(url, "Photo URL")).ToArray();
        if (materialized.Length > 10)
        {
            throw new DomainException("A location can have at most 10 photos.");
        }

        _photoUrls.Clear();
        _photoUrls.AddRange(materialized);
    }

    private static void ReplaceIds(List<string> target, IEnumerable<string> ids, string field)
    {
        target.Clear();
        target.AddRange(ids.Select(id => Guard.Id(id, field)).Distinct(StringComparer.OrdinalIgnoreCase));
    }
}
