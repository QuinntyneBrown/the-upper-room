using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Infrastructure.Contacts;

public sealed class ContactRow : IHasCity
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string CityId { get; set; } = "";
    public bool IsArchived { get; set; }
}
