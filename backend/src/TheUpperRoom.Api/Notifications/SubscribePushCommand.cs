using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record SubscribePushCommand(string UserId, PushSubscribeRequest? Body) : IRequest<PushOutcome>;
