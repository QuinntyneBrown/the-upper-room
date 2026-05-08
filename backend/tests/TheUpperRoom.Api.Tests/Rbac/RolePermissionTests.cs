// traces_to: L2-023
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Tests.Rbac;

public sealed class RolePermissionTests
{
    [Fact]
    public void SystemAdmin_has_user_role_audit_management()
    {
        var perms = Permissions.For(Roles.SystemAdmin);
        Assert.Contains("User:Manage", perms);
        Assert.Contains("Role:Manage", perms);
        Assert.Contains("Audit:Read", perms);
        Assert.Contains("City:Switch", perms);
    }

    [Fact]
    public void CityLead_can_CRUD_business_resources_but_not_manage_users()
    {
        var perms = Permissions.For(Roles.CityLead);
        Assert.Contains("Contact:Create", perms);
        Assert.Contains("Partner:Update", perms);
        Assert.DoesNotContain("User:Manage", perms);
    }

    [Fact]
    public void Member_can_read_but_not_create_contacts()
    {
        var perms = Permissions.For(Roles.Member);
        Assert.Contains("Contact:Read", perms);
        Assert.DoesNotContain("Contact:Create", perms);
        Assert.Contains("Note:Create", perms);
        Assert.Contains("Idea:Create", perms);
        Assert.Contains("Event:RSVP", perms);
    }

    [Fact]
    public void Guest_only_has_event_read_and_rsvp()
    {
        var perms = Permissions.For(Roles.Guest);
        Assert.Equal(new[] { "Event:Read", "Event:RSVP" }, perms);
    }
}
