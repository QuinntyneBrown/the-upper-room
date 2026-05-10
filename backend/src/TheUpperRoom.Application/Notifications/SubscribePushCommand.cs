using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record SubscribePushCommand(string UserId, PushSubscribeRequest? Body) : IRequest<PushOutcome>;
