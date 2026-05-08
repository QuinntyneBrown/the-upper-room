namespace TheUpperRoom.Domain.Rbac;

public sealed record RoleDefinition(string Name, IReadOnlyCollection<Permission> Permissions);
