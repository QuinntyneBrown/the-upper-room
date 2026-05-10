namespace TheUpperRoom.Api.Dashboard;

public sealed record GetDashboardResult(
    string FirstName,
    DashboardStats Stats,
    IReadOnlyList<DashboardEventDto> UpcomingEvents,
    IReadOnlyList<DashboardBoardGroupDto> TasksOnMyBoards);
