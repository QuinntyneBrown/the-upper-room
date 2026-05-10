using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Audit;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Tests;

// Pins the authorisation gate on /api/v1/audit (Unauthorized when user
// unknown, Forbidden when role lacks Audit:Read). The body of the
// happy path -- pagination + filtering -- iterates over a global static
// (AuditStore) so it isn't isolated enough for this surface.
public sealed class ListAuditEntriesHandlerTests
{
    private static ISender NewSender(IUserDirectory users, IPermissionChecker permissions)
    {
        var services = new ServiceCollection();
        services.AddSingleton(users);
        services.AddSingleton(permissions);
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    private static ListAuditEntriesQuery NewQuery(string userId = "user-1") =>
        new(userId, null, null, null, null, null, 1, 50);

    [Fact]
    public async Task Returns_Unauthorized_when_user_directory_returns_null()
    {
        var sender = NewSender(
            new StubDirectory(known: false),
            new AlwaysAllow());

        var result = await sender.Send(NewQuery());

        Assert.Equal(ListAuditEntriesOutcome.Unauthorized, result.Outcome);
        Assert.Empty(result.Items);
        Assert.Equal(0, result.Total);
        Assert.Equal(1, result.Page);
        Assert.Equal(50, result.PageSize);
    }

    [Fact]
    public async Task Returns_Forbidden_when_role_lacks_audit_read_permission()
    {
        var sender = NewSender(
            new StubDirectory(known: true),
            new AlwaysDeny());

        var result = await sender.Send(NewQuery());

        Assert.Equal(ListAuditEntriesOutcome.Forbidden, result.Outcome);
        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task Returns_Ok_when_user_known_and_audit_read_granted()
    {
        var sender = NewSender(
            new StubDirectory(known: true),
            new AlwaysAllow());

        var result = await sender.Send(NewQuery());

        Assert.Equal(ListAuditEntriesOutcome.Ok, result.Outcome);
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    private sealed class AlwaysAllow : IPermissionChecker
    {
        public IReadOnlyCollection<Permission> PermissionsFor(string roleName) => [];
        public bool HasPermission(string roleName, string resource, string action) => true;
    }

    private sealed class AlwaysDeny : IPermissionChecker
    {
        public IReadOnlyCollection<Permission> PermissionsFor(string roleName) => [];
        public bool HasPermission(string roleName, string resource, string action) => false;
    }
}
