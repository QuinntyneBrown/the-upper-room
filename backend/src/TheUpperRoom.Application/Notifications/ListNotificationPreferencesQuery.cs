using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record ListNotificationPreferencesQuery(string UserId) : IRequest<ListNotificationPreferencesResult>;
