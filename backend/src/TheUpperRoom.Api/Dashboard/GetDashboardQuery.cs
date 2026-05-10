using MediatR;

namespace TheUpperRoom.Api.Dashboard;

public sealed record GetDashboardQuery(string UserId) : IRequest<GetDashboardResult?>;
