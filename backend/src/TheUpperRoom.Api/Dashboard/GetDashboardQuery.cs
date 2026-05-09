using MediatR;

namespace TheUpperRoom.Api.Dashboard;

public sealed record GetDashboardQuery(string UserId) : IRequest<GetDashboardResult?>;

public sealed record DashboardStats(int Contacts, int Partners, int UpcomingEvents, int OpenIdeas);

public sealed record DashboardEventDto(string Id, string Title, string StartAt, string? Location);

public sealed record DashboardBoardGroupDto(string BoardId, string BoardTitle, object[] Cards);

public sealed record GetDashboardResult(
    string FirstName,
    DashboardStats Stats,
    IReadOnlyList<DashboardEventDto> UpcomingEvents,
    IReadOnlyList<DashboardBoardGroupDto> TasksOnMyBoards);
