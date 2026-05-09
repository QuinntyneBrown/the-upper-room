namespace TheUpperRoom.Domain.Rbac;

public static class RoleCatalog
{
    private static readonly string[] CityLeadResources =
    [
        PermissionResources.Contact,
        PermissionResources.Partner,
        PermissionResources.Tag,
        PermissionResources.Note,
        PermissionResources.KanbanBoard,
        PermissionResources.Idea,
        PermissionResources.Event,
        PermissionResources.Location
    ];

    private static readonly string[] CityLeadActions =
    [
        PermissionActions.Read,
        PermissionActions.Create,
        PermissionActions.Update,
        PermissionActions.Delete
    ];

    public static IReadOnlyCollection<RoleDefinition> All { get; } =
    [
        new(RoleNames.SystemAdmin, SystemAdminPermissions()),
        new(RoleNames.CityLead, CityLeadPermissions()),
        new(RoleNames.Member, MemberPermissions()),
        new(RoleNames.Guest,
        [
            new Permission(PermissionResources.Event, PermissionActions.Read),
            new Permission(PermissionResources.Event, PermissionActions.RSVP)
        ])
    ];

    public static IReadOnlyCollection<Permission> PermissionsFor(string roleName) =>
        All.SingleOrDefault(role => role.Name == roleName)?.Permissions ?? [];

    public static bool HasPermission(string roleName, string resource, string action) =>
        PermissionsFor(roleName).Contains(new Permission(resource, action));

    private static Permission[] SystemAdminPermissions() =>
    [
        .. CityLeadPermissions(),
        new(PermissionResources.KanbanBoard, PermissionActions.Configure),
        new(PermissionResources.User, PermissionActions.Manage),
        new(PermissionResources.Role, PermissionActions.Manage),
        new(PermissionResources.Audit, PermissionActions.Read),
        new(PermissionResources.City, PermissionActions.Switch)
    ];

    private static Permission[] CityLeadPermissions() =>
    [
        .. (from resource in CityLeadResources
            from action in CityLeadActions
            select new Permission(resource, action)),
        new(PermissionResources.KanbanBoard, PermissionActions.Configure),
    ];

    private static Permission[] MemberPermissions()
    {
        var permissions = CityLeadResources
            .Select(resource => new Permission(resource, PermissionActions.Read))
            .ToList();

        permissions.Add(new Permission(PermissionResources.Note, PermissionActions.Create));
        permissions.Add(new Permission(PermissionResources.Idea, PermissionActions.Create));
        permissions.Add(new Permission(PermissionResources.Event, PermissionActions.RSVP));
        return permissions.ToArray();
    }
}
