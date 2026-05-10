using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record ListNotificationPreferencesQuery(string UserId) : IRequest<ListNotificationPreferencesResult>;
