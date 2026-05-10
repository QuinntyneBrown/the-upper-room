using MediatR;

namespace TheUpperRoom.Api.Notifications;

public sealed record UpsertNotificationPreferenceCommand(string UserId, UpsertPreferenceRequest? Body) : IRequest<UpsertNotificationPreferenceResult>;
