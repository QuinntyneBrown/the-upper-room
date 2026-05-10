using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record ListNotificationsQuery(string UserId) : IRequest<ListNotificationsResult>;
