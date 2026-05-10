using MediatR;

namespace TheUpperRoom.Application.Events;

public sealed record SubmitRsvpCommand(string UserId, string EventId, RsvpRequest? Body) : IRequest<SubmitRsvpResult>;
