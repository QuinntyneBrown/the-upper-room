using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// GetCurrentUserHandler powers /api/me. The wire-shape MeResponse
// serialises directly to the JSON the SPA reads on every page load,
// so its content needs strong invariants.
public sealed class GetCurrentUserHandlerTests
{
    private static ISender NewSender(AppUser? user)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(user));
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task Returns_null_when_user_directory_returns_null()
    {
        var sender = NewSender(user: null);

        var result = await sender.Send(new GetCurrentUserQuery("missing"));

        Assert.Null(result);
    }

    [Fact]
    public async Task Returns_MeResponse_with_user_fields_and_role_in_roles_array()
    {
        var user = new AppUser("u-1", "ada@example.com", "city-1", "Member");
        var sender = NewSender(user);

        var result = await sender.Send(new GetCurrentUserQuery("u-1"));

        Assert.NotNull(result);
        Assert.Equal("u-1", result!.Id);
        Assert.Equal("ada@example.com", result.Email);
        Assert.Equal("city-1", result.City);
        Assert.Equal(["Member"], result.Roles);
    }

    [Fact]
    public async Task Permissions_are_serialised_as_resource_colon_action_strings()
    {
        var user = new AppUser("u-1", "ada@example.com", "city-1", "Member");
        var sender = NewSender(user);

        var result = await sender.Send(new GetCurrentUserQuery("u-1"));

        Assert.NotNull(result);
        // Member role has at least one permission. They must follow the
        // "Resource:Action" wire format that the SPA's permission checks
        // expect.
        Assert.NotEmpty(result!.Permissions);
        Assert.All(result.Permissions, p => Assert.Contains(":", p));
    }

    [Fact]
    public async Task Permissions_for_unknown_role_are_empty_not_null()
    {
        var user = new AppUser("u-1", "guest@example.com", "city-1", "NotARealRole");
        var sender = NewSender(user);

        var result = await sender.Send(new GetCurrentUserQuery("u-1"));

        // RoleCatalog.PermissionsFor returns empty for unknown roles --
        // the SPA must never receive null arrays.
        Assert.NotNull(result);
        Assert.NotNull(result!.Permissions);
        Assert.Empty(result.Permissions);
    }

    private sealed class StubDirectory(AppUser? user) : IUserDirectory
    {
        public AppUser? GetById(string id) => user;
        public IReadOnlyCollection<AppUser> All() => user is null ? [] : [user];
    }
}
