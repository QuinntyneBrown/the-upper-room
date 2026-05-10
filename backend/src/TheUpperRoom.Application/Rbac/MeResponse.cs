// traces_to: L2-023
namespace TheUpperRoom.Application.Rbac;

public sealed record MeResponse(string Id, string Email, string City, string[] Roles, string[] Permissions);
