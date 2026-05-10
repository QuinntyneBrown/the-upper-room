using MediatR;

namespace TheUpperRoom.Application.Events;

public sealed record GetRsvpRequestsQuery(string UserId, string EventId) : IRequest<GetRsvpRequestsResult>;
