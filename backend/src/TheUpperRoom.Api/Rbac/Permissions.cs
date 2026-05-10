// traces_to: L2-023
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Api.Rbac;

/// <summary>
/// Thin facade that returns a role's permissions formatted as the
/// "Resource:Action" strings the frontend currently consumes via /api/me.
/// Sourced from <see cref="RoleCatalog"/> so there is a single source of
/// truth for the role/permission mapping.
/// </summary>
public static class Permissions
{
    public static IReadOnlyList<string> For(string role) =>
        RoleCatalog.PermissionsFor(role).Select(p => p.ToString()).ToArray();
}
