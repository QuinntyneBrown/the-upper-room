using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Infrastructure.Rbac;

public sealed class PermissionChecker : IPermissionChecker
{
    public IReadOnlyCollection<Permission> PermissionsFor(string roleName) =>
        RoleCatalog.PermissionsFor(roleName);

    public bool HasPermission(string roleName, string resource, string action) =>
        RoleCatalog.HasPermission(roleName, resource, action);
}
