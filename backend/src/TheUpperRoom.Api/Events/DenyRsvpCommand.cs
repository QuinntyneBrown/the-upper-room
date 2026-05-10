using MediatR;

namespace TheUpperRoom.Api.Events;

public sealed record DenyRsvpCommand(string UserId, string EventId, string RsvpUserId) : IRequest<RsvpOutcome>;
