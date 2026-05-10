using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Kanban;

namespace TheUpperRoom.Api.Kanban;

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
