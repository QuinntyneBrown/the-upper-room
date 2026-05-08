// traces_to: L2-023
namespace TheUpperRoom.Api.Rbac;

public sealed record SeedUser(string Id, string Email, string City, string Role);

public static class SeedUsers
{
    public static readonly IReadOnlyDictionary<string, SeedUser> ById = new Dictionary<string, SeedUser>
    {
        ["admin"] = new("admin", "admin@example.com", "Toronto", Roles.SystemAdmin),
        ["lead"] = new("lead", "lead@example.com", "Toronto", Roles.CityLead),
        ["member"] = new("member", "member@example.com", "Toronto", Roles.Member),
        ["guest"] = new("guest", "guest@example.com", "Toronto", Roles.Guest),
    };
}
