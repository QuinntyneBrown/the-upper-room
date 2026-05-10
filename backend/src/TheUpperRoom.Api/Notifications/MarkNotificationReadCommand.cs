using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record MarkNotificationReadCommand(string UserId, string Id) : IRequest<MarkNotificationReadResult>;
