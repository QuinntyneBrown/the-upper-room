using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Domain.Common;

public abstract class CityScopedAuditableEntity : AuditableEntity, IHasCity
{
    protected CityScopedAuditableEntity(
        string cityId,
        string createdBy,
        DateTimeOffset createdAt,
        string? id = null) : base(createdBy, createdAt, id)
    {
        CityId = Guard.Id(cityId, nameof(CityId));
    }

    public string CityId { get; private set; }
}
