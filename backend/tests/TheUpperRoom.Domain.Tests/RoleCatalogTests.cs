// traces_to: L2-023
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Domain.Tests;

public sealed class RoleCatalogTests
{
    [Fact]
    public void Has_permission_returns_true_for_admin_user_manage()
    {
        Assert.True(RoleCatalog.HasPermission(
            RoleNames.SystemAdmin, PermissionResources.User, PermissionActions.Manage));
    }

    [Fact]
    public void Has_permission_returns_false_for_member_user_manage()
    {
        Assert.False(RoleCatalog.HasPermission(
            RoleNames.Member, PermissionResources.User, PermissionActions.Manage));
    }

    [Fact]
    public void Has_permission_returns_false_for_unknown_role()
    {
        Assert.False(RoleCatalog.HasPermission(
            "NotARealRole", PermissionResources.Contact, PermissionActions.Read));
    }

    [Fact]
    public void System_admin_inherits_city_lead_permissions()
    {
        var admin = RoleCatalog.PermissionsFor(RoleNames.SystemAdmin)
            .Select(p => p.ToString())
            .ToHashSet();
        var lead = RoleCatalog.PermissionsFor(RoleNames.CityLead)
            .Select(p => p.ToString())
            .ToHashSet();

        Assert.Subset(admin, lead);
    }

    [Fact]
    public void Permissions_for_unknown_role_is_empty()
    {
        Assert.Empty(RoleCatalog.PermissionsFor("Stranger"));
    }

    [Fact]
    public void City_switch_is_admin_only()
    {
        Assert.True(RoleCatalog.HasPermission(
            RoleNames.SystemAdmin, PermissionResources.City, PermissionActions.Switch));
        Assert.False(RoleCatalog.HasPermission(
            RoleNames.CityLead, PermissionResources.City, PermissionActions.Switch));
        Assert.False(RoleCatalog.HasPermission(
            RoleNames.Member, PermissionResources.City, PermissionActions.Switch));
        Assert.False(RoleCatalog.HasPermission(
            RoleNames.Guest, PermissionResources.City, PermissionActions.Switch));
    }

    [Fact]
    public void Idea_update_is_lead_or_above()
    {
        Assert.True(RoleCatalog.HasPermission(
            RoleNames.SystemAdmin, PermissionResources.Idea, PermissionActions.Update));
        Assert.True(RoleCatalog.HasPermission(
            RoleNames.CityLead, PermissionResources.Idea, PermissionActions.Update));
        Assert.False(RoleCatalog.HasPermission(
            RoleNames.Member, PermissionResources.Idea, PermissionActions.Update));
        Assert.False(RoleCatalog.HasPermission(
            RoleNames.Guest, PermissionResources.Idea, PermissionActions.Update));
    }
}
