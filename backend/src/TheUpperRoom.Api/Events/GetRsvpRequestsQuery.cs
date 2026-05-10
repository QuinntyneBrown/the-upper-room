using MediatR;

namespace TheUpperRoom.Api.Events;

public sealed record GetRsvpRequestsQuery(string UserId, string EventId) : IRequest<GetRsvpRequestsResult>;
