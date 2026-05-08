// traces_to: L2-079, L2-032
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Api.Contacts;

public sealed record Contact(string Id, string Name, string CityId) : IHasCity;

public sealed record CreateContactRequest(
    string FirstName,
    string? LastName,
    string? Pronouns,
    string? Title,
    string? Org,
    string? DisplayName);
