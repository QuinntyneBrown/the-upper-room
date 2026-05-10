using MediatR;

namespace TheUpperRoom.Application.Events;

public sealed record CancelEventCommand(string UserId, string EventId, string? Message) : IRequest<CancelEventResult>;
