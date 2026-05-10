using MediatR;

namespace TheUpperRoom.Application.Dashboard;

public sealed record GetDashboardQuery(string UserId) : IRequest<GetDashboardResult?>;
