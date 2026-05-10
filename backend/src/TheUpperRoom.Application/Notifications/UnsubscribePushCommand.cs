using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record UnsubscribePushCommand(string UserId) : IRequest<PushOutcome>;
