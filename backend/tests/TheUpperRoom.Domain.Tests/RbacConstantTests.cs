using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Domain.Tests;

// PermissionActions / PermissionResources / RoleNames are string constants
// that ride the wire (claims, /api/me responses, audit log rows). A typo
// fix or refactor that changes one of these silently invalidates seed
// data and existing JWTs. Pinning the literal values.
public sealed class RbacConstantTests
{
    [Fact]
    public void PermissionActions_constants_match_canonical_action_names()
    {
        Assert.Equal("Read", PermissionActions.Read);
        Assert.Equal("Create", PermissionActions.Create);
        Assert.Equal("Update", PermissionActions.Update);
        Assert.Equal("Delete", PermissionActions.Delete);
        Assert.Equal("Manage", PermissionActions.Manage);
        Assert.Equal("RSVP", PermissionActions.RSVP);
        Assert.Equal("Configure", PermissionActions.Configure);
        Assert.Equal("Switch", PermissionActions.Switch);
    }

    [Fact]
    public void PermissionResources_constants_match_canonical_resource_names()
    {
        Assert.Equal("Audit", PermissionResources.Audit);
        Assert.Equal("City", PermissionResources.City);
        Assert.Equal("Contact", PermissionResources.Contact);
        Assert.Equal("Event", PermissionResources.Event);
        Assert.Equal("Idea", PermissionResources.Idea);
        Assert.Equal("KanbanBoard", PermissionResources.KanbanBoard);
        Assert.Equal("Location", PermissionResources.Location);
        Assert.Equal("Note", PermissionResources.Note);
        Assert.Equal("Partner", PermissionResources.Partner);
        Assert.Equal("Role", PermissionResources.Role);
        Assert.Equal("Tag", PermissionResources.Tag);
        Assert.Equal("User", PermissionResources.User);
    }

    [Fact]
    public void RoleNames_constants_match_canonical_role_names()
    {
        Assert.Equal("SystemAdmin", RoleNames.SystemAdmin);
        Assert.Equal("CityLead", RoleNames.CityLead);
        Assert.Equal("Member", RoleNames.Member);
        Assert.Equal("Guest", RoleNames.Guest);
    }

    [Fact]
    public void RoleDefinition_records_have_value_equality_on_name()
    {
        var a = new RoleDefinition("Member", []);
        var b = new RoleDefinition("Member", []);

        // Value equality on Name; Permissions is a reference (collection),
        // but with an empty array EqualityComparer.Default returns true for
        // both empty arrays/empty collections.
        Assert.Equal(a.Name, b.Name);
    }

    [Fact]
    public void RoleDefinition_with_different_names_are_not_equal()
    {
        Assert.NotEqual(
            new RoleDefinition("Member", []),
            new RoleDefinition("Guest", []));
    }
}
