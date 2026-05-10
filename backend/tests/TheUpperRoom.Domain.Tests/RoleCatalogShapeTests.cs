using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Domain.Tests;

public sealed class RoleCatalogShapeTests
{
    [Fact]
    public void All_returns_the_four_canonical_role_definitions()
    {
        var names = RoleCatalog.All.Select(r => r.Name).ToHashSet();

        Assert.Contains(RoleNames.SystemAdmin, names);
        Assert.Contains(RoleNames.CityLead, names);
        Assert.Contains(RoleNames.Member, names);
        Assert.Contains(RoleNames.Guest, names);
        Assert.Equal(4, RoleCatalog.All.Count);
    }

    [Fact]
    public void Every_role_definition_has_at_least_one_permission()
    {
        Assert.All(RoleCatalog.All, role =>
        {
            Assert.NotEmpty(role.Permissions);
        });
    }

    [Fact]
    public void Guest_has_only_event_read_and_rsvp()
    {
        var guest = RoleCatalog.PermissionsFor(RoleNames.Guest)
            .Select(p => p.ToString())
            .ToArray();

        Assert.Equal(new[] { "Event:Read", "Event:RSVP" }, guest);
    }

    [Fact]
    public void System_admin_includes_audit_read_and_role_manage()
    {
        var admin = RoleCatalog.PermissionsFor(RoleNames.SystemAdmin)
            .Select(p => p.ToString())
            .ToHashSet();

        Assert.Contains("Audit:Read", admin);
        Assert.Contains("Role:Manage", admin);
    }
}
