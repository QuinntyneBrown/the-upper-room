using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Domain.Rbac;
using TheUpperRoom.Infrastructure.Rbac;

namespace TheUpperRoom.Infrastructure.Tests.Rbac;

public sealed class PermissionCheckerTests
{
    [Fact]
    public void Has_permission_delegates_to_role_catalog()
    {
        IPermissionChecker checker = new PermissionChecker();

        Assert.True(checker.HasPermission(
            RoleNames.SystemAdmin, PermissionResources.User, PermissionActions.Manage));
        Assert.False(checker.HasPermission(
            RoleNames.Member, PermissionResources.User, PermissionActions.Manage));
    }

    [Fact]
    public void Permissions_for_returns_role_catalog_set()
    {
        IPermissionChecker checker = new PermissionChecker();

        var member = checker.PermissionsFor(RoleNames.Member);

        Assert.Contains(new Permission(PermissionResources.Contact, PermissionActions.Read), member);
        Assert.DoesNotContain(new Permission(PermissionResources.User, PermissionActions.Manage), member);
    }

    [Fact]
    public void Permissions_for_unknown_role_is_empty()
    {
        IPermissionChecker checker = new PermissionChecker();

        Assert.Empty(checker.PermissionsFor("Stranger"));
    }
}
