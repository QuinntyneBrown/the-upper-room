using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record ListNotificationsQuery(string UserId) : IRequest<ListNotificationsResult>;
