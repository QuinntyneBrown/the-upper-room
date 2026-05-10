using MediatR;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Notifications;

namespace TheUpperRoom.Api.Notifications;

internal sealed class SubscribePushHandler : IRequestHandler<SubscribePushCommand, PushOutcome>
{
    private readonly PushDbContext _db;
    private readonly IUserDirectory _users;

    public SubscribePushHandler(PushDbContext db, IUserDirectory users)
    {
        _db = db;
        _users = users;
    }

    public Task<PushOutcome> Handle(SubscribePushCommand request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult(PushOutcome.Unauthorized);
        if (request.Body is null) return Task.FromResult(PushOutcome.BadRequest);

        var existing = _db.Subscriptions.Find(user.Id);
        if (existing is not null) _db.Subscriptions.Remove(existing);
        _db.Subscriptions.Add(new PushSubscriptionRow
        {
            UserId = user.Id,
            Endpoint = request.Body.Endpoint,
            P256dh = request.Body.Keys?.P256dh ?? "",
            Auth = request.Body.Keys?.Auth ?? "",
        });
        _db.SaveChanges();
        return Task.FromResult(PushOutcome.NoContent);
    }
}
