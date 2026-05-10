using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record DispatchNotificationCommand(string UserId, DispatchRequest? Body) : IRequest<DispatchNotificationResult>;
