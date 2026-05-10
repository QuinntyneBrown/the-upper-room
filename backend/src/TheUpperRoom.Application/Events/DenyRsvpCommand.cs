using MediatR;

namespace TheUpperRoom.Application.Events;

public sealed record DenyRsvpCommand(string UserId, string EventId, string RsvpUserId) : IRequest<RsvpOutcome>;
