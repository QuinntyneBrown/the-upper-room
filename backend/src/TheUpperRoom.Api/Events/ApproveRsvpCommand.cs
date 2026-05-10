using MediatR;

namespace TheUpperRoom.Api.Events;

public sealed record ApproveRsvpCommand(string UserId, string EventId, string RsvpUserId) : IRequest<RsvpOutcome>;
