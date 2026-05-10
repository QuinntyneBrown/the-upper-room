using MediatR;
using TheUpperRoom.Api.Contacts;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Kanban;
using TheUpperRoom.Api.Partners;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Dashboard;

internal sealed class GetDashboardHandler : IRequestHandler<GetDashboardQuery, GetDashboardResult?>
{
    private readonly ContactsDbContext _contactsDb;
    private readonly EventsDbContext _eventsDb;
    private readonly IdeasDbContext _ideasDb;
    private readonly KanbanDbContext _kanbanDb;
    private readonly IUserDirectory _users;
    private readonly IPermissionChecker _permissions;

    public GetDashboardHandler(
        ContactsDbContext contactsDb,
        EventsDbContext eventsDb,
        IdeasDbContext ideasDb,
        KanbanDbContext kanbanDb,
        IUserDirectory users,
        IPermissionChecker permissions)
    {
        _contactsDb = contactsDb;
        _eventsDb = eventsDb;
        _ideasDb = ideasDb;
        _kanbanDb = kanbanDb;
        _users = users;
        _permissions = permissions;
    }

    public Task<GetDashboardResult?> Handle(GetDashboardQuery request, CancellationToken cancellationToken)
    {
        var user = _users.GetById(request.UserId);
        if (user is null) return Task.FromResult<GetDashboardResult?>(null);

        var canSeeAllCities = _permissions.HasPermission(
            user.Role, PermissionResources.City, PermissionActions.Switch);

        var now = DateTimeOffset.UtcNow;

        var allUpcoming = _eventsDb.Events
            .AsEnumerable()
            .Where(e => e.StartAt > now && e.Status != "Cancelled")
            .OrderBy(e => e.StartAt)
            .ToList();

        var stats = new DashboardStats(
            Contacts: ContactsController.StoreCount(user, _contactsDb, canSeeAllCities),
            Partners: PartnersController.StoreCount(),
            UpcomingEvents: allUpcoming.Count,
            OpenIdeas: IdeasController.StoreCount(_ideasDb));

        var upcomingEvents = allUpcoming
            .Take(5)
            .Select(e => new DashboardEventDto(e.Id, e.Title, e.StartAt.ToString("O"), e.Location))
            .ToList();

        var boardGroups = BoardsController.GetMyBoardGroups(user.Id, _kanbanDb)
            .Select(g => new DashboardBoardGroupDto(g.BoardId, g.BoardTitle, g.Cards))
            .ToList();

        var firstName = user.Email.Split('@')[0].Split('.')[0];
        firstName = char.ToUpper(firstName[0]) + firstName[1..];

        return Task.FromResult<GetDashboardResult?>(
            new GetDashboardResult(firstName, stats, upcomingEvents, boardGroups));
    }
}
