using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record MarkNotificationReadCommand(string UserId, string Id) : IRequest<MarkNotificationReadResult>;
