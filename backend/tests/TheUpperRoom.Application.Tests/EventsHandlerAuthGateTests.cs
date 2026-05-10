using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Events;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// Pins the auth gates on the Event mutation handlers. They short-circuit
// to Unauthorized before touching IEventsDbContext; the throwing stub
// surfaces gate-bypass regressions.
public sealed class EventsHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddSingleton<IEventsDbContext>(new StubEventsDb());
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task CancelEvent_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new CancelEventCommand("missing", "event-1", null));

        Assert.Equal(CancelEventOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Event);
    }

    [Fact]
    public async Task SubmitRsvp_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new SubmitRsvpCommand(
            "missing", "event-1", new RsvpRequest("Going")));

        Assert.Equal(RsvpOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Response);
    }

    [Fact]
    public async Task SubmitRsvp_returns_BadRequest_when_body_is_null_for_known_user()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new SubmitRsvpCommand(
            "user-1", "event-1", Body: null));

        Assert.Equal(RsvpOutcome.BadRequest, result.Outcome);
    }

    [Fact]
    public void CancelEventOutcome_enum_pins_wire_shape()
    {
        Assert.Equal(
            new[] { "Cancelled", "NotFound", "Unauthorized" },
            Enum.GetNames<CancelEventOutcome>());
    }

    [Fact]
    public void RsvpOutcome_enum_pins_wire_shape()
    {
        Assert.Equal(
            new[] { "Ok", "Unauthorized", "NotFound", "BadRequest" },
            Enum.GetNames<RsvpOutcome>());
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    private sealed class StubEventsDb : IEventsDbContext
    {
        public DbSet<EventRow> Events =>
            throw new InvalidOperationException("Auth gate should not have reached the DB.");
        public DbSet<RsvpRow> Rsvps =>
            throw new InvalidOperationException("Auth gate should not have reached the DB.");
        public int SaveChanges() => throw new InvalidOperationException();
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException();
    }
}
