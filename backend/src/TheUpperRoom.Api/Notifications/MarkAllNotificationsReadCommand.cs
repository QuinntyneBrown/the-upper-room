using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record MarkAllNotificationsReadCommand(string UserId) : IRequest<NotificationsOutcome>;
