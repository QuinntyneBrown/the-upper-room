using MediatR;

namespace TheUpperRoom.Api.Events;

public sealed record SubmitRsvpCommand(string UserId, string EventId, RsvpRequest? Body) : IRequest<SubmitRsvpResult>;
