using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Rbac;

public interface IPermissionChecker
{
    IReadOnlyCollection<Permission> PermissionsFor(string roleName);

    bool HasPermission(string roleName, string resource, string action);
}
