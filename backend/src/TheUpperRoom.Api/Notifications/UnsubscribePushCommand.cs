using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record UnsubscribePushCommand(string UserId) : IRequest<PushOutcome>;
