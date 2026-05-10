using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record MarkAllNotificationsReadCommand(string UserId) : IRequest<NotificationsOutcome>;
