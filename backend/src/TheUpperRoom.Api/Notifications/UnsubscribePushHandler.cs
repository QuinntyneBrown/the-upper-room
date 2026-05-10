using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Notifications;

internal sealed class UnsubscribePushHandler : IRequestHandler<UnsubscribePushCommand, PushOutcome>
{
    private readonly PushDbContext _db;
    private readonly IUserDirectory _users;

    public UnsubscribePushHandler(PushDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<PushOutcome> Handle(UnsubscribePushCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(PushOutcome.Unauthorized);

        var existing = _db.Subscriptions.Find(user.Id);
        if (existing is not null)
        {
            _db.Subscriptions.Remove(existing);
            _db.SaveChanges();
        }
        return Task.FromResult(PushOutcome.NoContent);
    }
}
