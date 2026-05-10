using MediatR;

namespace TheUpperRoom.Application.Notifications;

public sealed record UpsertNotificationPreferenceCommand(string UserId, UpsertPreferenceRequest? Body) : IRequest<UpsertNotificationPreferenceResult>;
