using MediatR;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Notifications;

public sealed record GetVapidPublicKeyQuery() : IRequest<string>;

public sealed record SubscribePushCommand(string UserId, PushSubscribeRequest? Body) : IRequest<PushOutcome>;

public sealed record UnsubscribePushCommand(string UserId) : IRequest<PushOutcome>;

public enum PushOutcome
{
    NoContent,
    Unauthorized,
    BadRequest,
}

internal sealed class GetVapidPublicKeyHandler : IRequestHandler<GetVapidPublicKeyQuery, string>
{
    private readonly PushSettings _settings;
    public GetVapidPublicKeyHandler(PushSettings settings) => _settings = settings;
    public Task<string> Handle(GetVapidPublicKeyQuery request, CancellationToken cancellationToken) =>
        Task.FromResult(_settings.VapidPublicKey ?? "");
}

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
