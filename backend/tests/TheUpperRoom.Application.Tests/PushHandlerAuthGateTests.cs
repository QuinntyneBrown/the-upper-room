using MediatR;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Notifications;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// Pins the auth gate on UnsubscribePush. The handler short-circuits to
// Unauthorized when the user is unknown, before it touches the
// IPushDbContext -- so we don't need a working EF mock to verify the
// gate. The DB-mutation path is covered by Api.Tests' integration tests.
public sealed class PushHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddSingleton<IPushDbContext>(new StubPushDb());
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task Unsubscribe_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new UnsubscribePushCommand("missing"));

        Assert.Equal(PushOutcome.Unauthorized, result);
    }

    [Fact]
    public async Task Subscribe_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new SubscribePushCommand(
            "missing",
            new PushSubscribeRequest("https://example.com/push", new PushKeys("p", "a"))));

        Assert.Equal(PushOutcome.Unauthorized, result);
    }

    [Fact]
    public async Task Subscribe_returns_BadRequest_when_body_is_null_even_for_known_user()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new SubscribePushCommand("user-1", Body: null));

        Assert.Equal(PushOutcome.BadRequest, result);
    }

    [Fact]
    public async Task PushOutcome_enum_has_no_content_unauthorized_bad_request()
    {
        // Pin the wire-shape of PushOutcome -- it routes 204/401/400
        // in the controller layer.
        Assert.Equal(
            new[] { "NoContent", "Unauthorized", "BadRequest" },
            Enum.GetNames<PushOutcome>());
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    // Minimal stub: never actually hit because the auth gate short-circuits
    // first on the Unauthorized path. Throws if any property is touched
    // so a regression that bypasses the gate is loud.
    private sealed class StubPushDb : IPushDbContext
    {
        public Microsoft.EntityFrameworkCore.DbSet<PushSubscriptionRow> Subscriptions =>
            throw new InvalidOperationException("Auth gate should not have reached the DB.");
        public Microsoft.EntityFrameworkCore.DbSet<PendingPushRow> PendingPushes =>
            throw new InvalidOperationException("Auth gate should not have reached the DB.");
        public int SaveChanges() => throw new InvalidOperationException();
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException();
    }
}
