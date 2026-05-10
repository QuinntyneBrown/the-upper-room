using MediatR;

namespace TheUpperRoom.Application.Events;

public sealed record ApproveRsvpCommand(string UserId, string EventId, string RsvpUserId) : IRequest<RsvpOutcome>;
