using MediatR;

namespace TheUpperRoom.Api.Events;

public sealed record GetMyRsvpQuery(string UserId, string EventId) : IRequest<GetMyRsvpResult>;
