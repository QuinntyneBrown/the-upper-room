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
        services.AddSingleton<INotificationsDbContext>(new StubNotificationsDb());
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
