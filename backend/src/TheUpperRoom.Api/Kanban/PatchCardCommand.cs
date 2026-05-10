using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Kanban;

public sealed record PatchCardCommand(string UserId, string CardId, Dictionary<string, object?>? Body)
    : IRequest<PatchCardResult>;

public sealed record PatchCardResult(object? Payload, KanbanOutcome Outcome);

public sealed record MoveCardCommand(string UserId, string CardId, string? TargetColumnId)
    : IRequest<MoveCardResult>;

public sealed record MoveCardResult(object? Payload, KanbanOutcome Outcome);

public enum KanbanOutcome
{
    Ok,
    Unauthorized,
    NotFound,
    BadRequest,
    Unprocessable,
}

internal sealed class PatchCardHandler : IRequestHandler<PatchCardCommand, PatchCardResult>
{
    private readonly KanbanDbContext _db;
    private readonly IUserDirectory _users;

    public PatchCardHandler(KanbanDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<PatchCardResult> Handle(PatchCardCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new PatchCardResult(null, KanbanOutcome.Unauthorized));
        if (request.Body is null)
            return Task.FromResult(new PatchCardResult(null, KanbanOutcome.BadRequest));

        var card = _db.Cards.Find(request.CardId);
        if (card is null)
            return Task.FromResult(new PatchCardResult(null, KanbanOutcome.NotFound));

        if (request.Body.TryGetValue("title", out var title) && title is string t) card.Title = t;
        if (request.Body.TryGetValue("assigneeName", out var assignee)) card.AssigneeName = assignee?.ToString();
        if (request.Body.TryGetValue("dueDate", out var due)) card.DueDate = due?.ToString();
        if (request.Body.TryGetValue("archived", out var archived))
        {
            card.Archived = archived switch
            {
                bool b => b,
                System.Text.Json.JsonElement je when je.ValueKind == System.Text.Json.JsonValueKind.True => true,
                System.Text.Json.JsonElement je when je.ValueKind == System.Text.Json.JsonValueKind.False => false,
                string s when bool.TryParse(s, out var p) => p,
                _ => card.Archived,
            };
        }
        _db.SaveChanges();

        return Task.FromResult(new PatchCardResult(new { id = request.CardId, patched = request.Body }, KanbanOutcome.Ok));
    }
}

public sealed record DeleteCardCommand(string UserId, string CardId)
    : IRequest<DeleteCardResult>;

public sealed record DeleteCardResult(KanbanOutcome Outcome);

internal sealed class DeleteCardHandler : IRequestHandler<DeleteCardCommand, DeleteCardResult>
{
    private readonly KanbanDbContext _db;
    private readonly IUserDirectory _users;

    public DeleteCardHandler(KanbanDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<DeleteCardResult> Handle(DeleteCardCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new DeleteCardResult(KanbanOutcome.Unauthorized));

        var card = _db.Cards.Find(request.CardId);
        if (card is null)
            return Task.FromResult(new DeleteCardResult(KanbanOutcome.NotFound));

        _db.Cards.Remove(card);
        _db.SaveChanges();

        return Task.FromResult(new DeleteCardResult(KanbanOutcome.Ok));
    }
}

internal sealed class MoveCardHandler : IRequestHandler<MoveCardCommand, MoveCardResult>
{
    private readonly KanbanDbContext _db;
    private readonly IUserDirectory _users;

    public MoveCardHandler(KanbanDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<MoveCardResult> Handle(MoveCardCommand request, CancellationToken cancellationToken)
    {
        if (_users.GetById(request.UserId) is null)
            return Task.FromResult(new MoveCardResult(null, KanbanOutcome.Unauthorized));
        if (string.IsNullOrWhiteSpace(request.TargetColumnId))
            return Task.FromResult(new MoveCardResult(new { error = "targetColumnId is required." }, KanbanOutcome.Unprocessable));

        var card = _db.Cards.Find(request.CardId);
        if (card is null)
            return Task.FromResult(new MoveCardResult(null, KanbanOutcome.NotFound));

        card.ColumnId = request.TargetColumnId;
        _db.SaveChanges();

        return Task.FromResult(new MoveCardResult(new { id = request.CardId, columnId = request.TargetColumnId }, KanbanOutcome.Ok));
    }
}
