// traces_to: L2-079, L2-032
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Application.Contacts;

public sealed record Contact(string Id, string Name, string CityId) : IHasCity;
