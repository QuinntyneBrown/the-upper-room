using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Kanban;

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
