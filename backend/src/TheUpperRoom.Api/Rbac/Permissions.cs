// traces_to: L2-023
namespace TheUpperRoom.Api.Rbac;

public static class Permissions
{
    private static readonly string[] CityLeadResources =
    {
        "Contact", "Partner", "Tag", "Note", "KanbanBoard", "Idea", "Event", "Location"
    };

    private static readonly string[] CityLeadActions = { "Read", "Create", "Update", "Delete" };

    private static readonly string[] MemberResources = CityLeadResources;

    public static IReadOnlyList<string> For(string role) => role switch
    {
        Roles.SystemAdmin => SystemAdminPermissions(),
        Roles.CityLead => CityLeadPermissions(),
        Roles.Member => MemberPermissions(),
        Roles.Guest => new[] { "Event:Read", "Event:RSVP" },
        _ => Array.Empty<string>()
    };

    private static string[] SystemAdminPermissions()
    {
        var list = new List<string>(CityLeadPermissions())
        {
            "User:Manage",
            "Role:Manage",
            "Audit:Read",
            "City:Switch"
        };
        return list.ToArray();
    }

    private static string[] CityLeadPermissions() =>
        (from r in CityLeadResources
         from a in CityLeadActions
         select $"{r}:{a}").ToArray();

    private static string[] MemberPermissions()
    {
        var perms = MemberResources.Select(r => $"{r}:Read").ToList();
        perms.Add("Note:Create");
        perms.Add("Idea:Create");
        perms.Add("Event:RSVP");
        return perms.ToArray();
    }
}
