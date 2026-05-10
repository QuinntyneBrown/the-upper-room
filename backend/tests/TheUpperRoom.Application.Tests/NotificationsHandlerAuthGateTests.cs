using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Notifications;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// Pins the auth gates on the notifications mark-read handlers.
// Each short-circuits to Unauthorized before touching INotificationsDbContext;
// the throwing stub surfaces any gate-bypass regression.
public sealed class NotificationsHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        var notifDb = new StubNotificationsDb();
        services.AddSingleton<INotificationsDbContext>(notifDb);
        services.AddSingleton<IPushDbContext>(new ThrowingPushDb());
        // MailStore + PushDispatcher are concrete and DispatchNotificationHandler
        // depends on them; the auth tests short-circuit before they fire.
        services.AddSingleton(sp => new MailStore(sp.GetRequiredService<INotificationsDbContext>()));
        services.AddSingleton(sp => new PushDispatcher(sp.GetRequiredService<IPushDbContext>()));
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task MarkAll_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new MarkAllNotificationsReadCommand("missing"));

        Assert.Equal(NotificationsOutcome.Unauthorized, result);
    }

    [Fact]
    public async Task MarkOne_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new MarkNotificationReadCommand("missing", "n-1"));

        Assert.Equal(NotificationsOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Notification);
    }

    [Fact]
    public async Task UpsertPreference_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new UpsertNotificationPreferenceCommand(
            "missing", new UpsertPreferenceRequest("welcome", true, true, false)));

        Assert.Equal(NotificationsOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Payload);
    }

    [Fact]
    public async Task UpsertPreference_returns_BadRequest_when_body_is_null()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new UpsertNotificationPreferenceCommand("user-1", Body: null));

        Assert.Equal(NotificationsOutcome.BadRequest, result.Outcome);
    }

    [Fact]
    public async Task ListNotifications_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new ListNotificationsQuery("missing"));

        Assert.Equal(NotificationsOutcome.Unauthorized, result.Outcome);
        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task ListNotificationPreferences_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new ListNotificationPreferencesQuery("missing"));

        Assert.Equal(NotificationsOutcome.Unauthorized, result.Outcome);
        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task DispatchNotification_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new DispatchNotificationCommand(
            "missing", new DispatchRequest("welcome", ["recipient-1"], null)));

        Assert.Equal(NotificationsOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task DispatchNotification_returns_BadRequest_when_body_null()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new DispatchNotificationCommand("user-1", Body: null));

        Assert.Equal(NotificationsOutcome.BadRequest, result.Outcome);
    }

    [Fact]
    public async Task DispatchNotification_returns_Unprocessable_for_unknown_code()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new DispatchNotificationCommand(
            "user-1",
            new DispatchRequest("not_a_real_code", ["recipient-1"], null)));

        Assert.Equal(NotificationsOutcome.Unprocessable, result.Outcome);
        Assert.Contains("not_a_real_code", result.Error);
    }

    [Fact]
    public void NotificationsOutcome_enum_pins_wire_shape()
    {
        Assert.Equal(
            new[] { "Ok", "NoContent", "Unauthorized", "BadRequest", "NotFound", "Unprocessable" },
            Enum.GetNames<NotificationsOutcome>());
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    private sealed class ThrowingPushDb : IPushDbContext
    {
        private const string Bypass = "Auth gate should not have reached the push DB.";
        public DbSet<PushSubscriptionRow> Subscriptions => throw new InvalidOperationException(Bypass);
        public DbSet<PendingPushRow> PendingPushes => throw new InvalidOperationException(Bypass);
        public int SaveChanges() => throw new InvalidOperationException(Bypass);
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(Bypass);
    }

    private sealed class StubNotificationsDb : INotificationsDbContext
    {
        private const string Bypass = "Auth gate should not have reached the DB.";
        public DbSet<NotificationRow> Notifications => throw new InvalidOperationException(Bypass);
        public DbSet<PreferenceRow> Preferences => throw new InvalidOperationException(Bypass);
        public DbSet<SentMailRow> SentMail => throw new InvalidOperationException(Bypass);
        public DbSet<DigestPreferenceRow> DigestPreferences => throw new InvalidOperationException(Bypass);
        public int SaveChanges() => throw new InvalidOperationException(Bypass);
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException(Bypass);
    }
}
