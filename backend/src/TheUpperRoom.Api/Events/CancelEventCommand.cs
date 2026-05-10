using MediatR;

namespace TheUpperRoom.Api.Events;

public sealed record CancelEventCommand(string UserId, string EventId, string? Message) : IRequest<CancelEventResult>;
