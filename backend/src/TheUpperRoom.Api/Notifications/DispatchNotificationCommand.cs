using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record DispatchNotificationCommand(string UserId, DispatchRequest? Body) : IRequest<DispatchNotificationResult>;
