using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Kanban;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// Pins auth gates on the Kanban card-mutation handlers.
public sealed class KanbanHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddSingleton<IKanbanDbContext>(new StubKanbanDb());
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task MoveCard_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new MoveCardCommand("missing", "card-1", "col-2"));

        Assert.Equal(KanbanOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task MoveCard_validator_rejects_blank_target_column_via_pipeline()
    {
        // The MoveCardCommandValidator catches blank TargetColumnId before
        // the handler does (the handler's own check is defensive belt-and-
        // braces). The pipeline surfaces the failure as a ValidationException.
        var sender = NewSender(userKnown: true);

        await Assert.ThrowsAsync<FluentValidation.ValidationException>(() =>
            sender.Send(new MoveCardCommand("user-1", "card-1", "   ")));
    }

    [Fact]
    public async Task DeleteCard_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new DeleteCardCommand("missing", "card-1"));

        Assert.Equal(KanbanOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task PatchCard_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new PatchCardCommand(
            "missing", "card-1", new Dictionary<string, object?>()));

        Assert.Equal(KanbanOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task PatchCard_returns_BadRequest_when_body_null_for_known_user()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new PatchCardCommand("user-1", "card-1", Body: null));

        Assert.Equal(KanbanOutcome.BadRequest, result.Outcome);
    }

    [Fact]
    public void KanbanOutcome_enum_pins_wire_shape()
    {
        Assert.Equal(
            new[] { "Ok", "Unauthorized", "NotFound", "BadRequest", "Unprocessable" },
            Enum.GetNames<KanbanOutcome>());
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    private sealed class StubKanbanDb : IKanbanDbContext
    {
        private const string Bypass = "Auth gate should not have reached the DB.";
        public DbSet<BoardRow> Boards => throw new InvalidOperationException(Bypass);
        public DbSet<BoardColumnRow> Columns => throw new InvalidOperationException(Bypass);
        public DbSet<CardRow> Cards => throw new InvalidOperationException(Bypass);
        public int SaveChanges() => throw new InvalidOperationException();
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException();
    }
}
