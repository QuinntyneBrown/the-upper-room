using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Notes;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// Pins the auth + validation gates on CreateNote. The handler runs all
// these checks before touching INotesDbContext, so a throwing stub
// surfaces any future regression that bypasses them.
public sealed class NotesHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddSingleton<INotesDbContext>(new StubNotesDb());
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task CreateNote_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new CreateNoteCommand("missing",
            new CreateNoteRequest("Contact", "c-1", "body")));

        Assert.Equal(NotesOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Note);
    }

    [Fact]
    public async Task CreateNote_returns_BadRequest_when_body_is_null()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new CreateNoteCommand("user-1", Body: null));

        Assert.Equal(NotesOutcome.BadRequest, result.Outcome);
    }

    [Fact]
    public async Task CreateNote_validator_rejects_blank_body_markdown_via_pipeline()
    {
        // The CreateNoteCommandValidator catches blank BodyMarkdown before
        // the handler does, throwing FluentValidation.ValidationException
        // through the MediatR ValidationBehavior. The handler's own
        // IsNullOrWhiteSpace check is defensive belt-and-braces.
        var sender = NewSender(userKnown: true);

        await Assert.ThrowsAsync<FluentValidation.ValidationException>(() =>
            sender.Send(new CreateNoteCommand("user-1",
                new CreateNoteRequest("Contact", "c-1", BodyMarkdown: "   "))));
    }

    [Fact]
    public async Task CreateNote_returns_Unprocessable_for_invalid_subject_type()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new CreateNoteCommand("user-1",
            new CreateNoteRequest("Galaxy", "c-1", "valid body")));

        Assert.Equal(NotesOutcome.Unprocessable, result.Outcome);
        Assert.Contains("subjectType", result.Error);
    }

    [Fact]
    public async Task DeleteNote_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new DeleteNoteCommand("missing", "note-1"));

        Assert.Equal(NotesOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task GetNote_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new GetNoteQuery("missing", "note-1"));

        Assert.Equal(NotesOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Note);
    }

    [Fact]
    public async Task UpdateNote_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new UpdateNoteCommand(
            "missing", "note-1", new UpdateNoteRequest("body")));

        Assert.Equal(NotesOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task ListNotes_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new ListNotesQuery("missing", "Contact", "c-1"));

        Assert.Equal(NotesOutcome.Unauthorized, result.Outcome);
        Assert.Empty(result.Items);
    }

    [Fact]
    public async Task ListNotes_returns_BadRequest_for_invalid_subject_type()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new ListNotesQuery("user-1", "Galaxy", "x"));

        Assert.Equal(NotesOutcome.BadRequest, result.Outcome);
        Assert.Contains("subjectType", result.Error);
    }

    [Fact]
    public void NotesOutcome_enum_pins_wire_shape()
    {
        Assert.Equal(
            new[] { "Ok", "Created", "NoContent", "Unauthorized", "NotFound", "BadRequest", "Unprocessable" },
            Enum.GetNames<NotesOutcome>());
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    private sealed class StubNotesDb : INotesDbContext
    {
        public DbSet<NoteRow> Notes =>
            throw new InvalidOperationException("Auth/validation gate should not have reached the DB.");
        public int SaveChanges() => throw new InvalidOperationException();
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException();
    }
}
