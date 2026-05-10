using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Kanban;

internal sealed class PatchCardHandler : IRequestHandler<PatchCardCommand, PatchCardResult>
{
    private readonly IKanbanDbContext _db;
    private readonly IUserDirectory _users;

    public PatchCardHandler(IKanbanDbContext db, IUserDirectory users)
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
