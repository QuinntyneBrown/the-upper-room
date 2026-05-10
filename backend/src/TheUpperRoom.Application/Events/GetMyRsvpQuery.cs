using MediatR;

namespace TheUpperRoom.Application.Events;

public sealed record GetMyRsvpQuery(string UserId, string EventId) : IRequest<GetMyRsvpResult>;
