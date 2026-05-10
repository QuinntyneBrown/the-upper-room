using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Kanban;

internal sealed class DeleteCardHandler : IRequestHandler<DeleteCardCommand, DeleteCardResult>
{
    private readonly IKanbanDbContext _db;
    private readonly IUserDirectory _users;

    public DeleteCardHandler(IKanbanDbContext db, IUserDirectory users)
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
