using MediatR;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Events;
using TheUpperRoom.Application.Ideas;
using TheUpperRoom.Application.Kanban;
using TheUpperRoom.Application.Partners;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Dashboard;

internal sealed class GetDashboardHandler : IRequestHandler<GetDashboardQuery, GetDashboardResult?>
{
    private readonly IContactsDbContext _contactsDb;
    private readonly IEventsDbContext _eventsDb;
    private readonly IIdeasDbContext _ideasDb;
    private readonly IKanbanDbContext _kanbanDb;
    private readonly IPartnersStore _partners;
    private readonly IUserDirectory _users;
    private readonly IPermissionChecker _permissions;

    public GetDashboardHandler(
        IContactsDbContext contactsDb,
        IEventsDbContext eventsDb,
        IIdeasDbContext ideasDb,
        IKanbanDbContext kanbanDb,
        IPartnersStore partners,
        IUserDirectory users,
        IPermissionChecker permissions)
    {
        _contactsDb = contactsDb;
        _eventsDb = eventsDb;
        _ideasDb = ideasDb;
        _kanbanDb = kanbanDb;
        _partners = partners;
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

        var contactsCount = canSeeAllCities
            ? _contactsDb.Contacts.Count()
            : _contactsDb.Contacts.Count(c => c.CityId == user.City);

        var openIdeasCount = _ideasDb.Ideas.Count(i => i.Status != "Archived" && i.Status != "Completed");

        var stats = new DashboardStats(
            Contacts: contactsCount,
            Partners: _partners.CountActive(),
            UpcomingEvents: allUpcoming.Count,
            OpenIdeas: openIdeasCount);

        var upcomingEvents = allUpcoming
            .Take(5)
            .Select(e => new DashboardEventDto(e.Id, e.Title, e.StartAt.ToString("O"), e.Location))
            .ToList();

        var boardGroups = _kanbanDb.Boards
            .Select(b => new { b.Id, b.Name })
            .AsEnumerable()
            .Select(b => new DashboardBoardGroupDto(b.Id, b.Name, Array.Empty<object>()))
            .ToList();

        var firstName = user.Email.Split('@')[0].Split('.')[0];
        firstName = char.ToUpper(firstName[0]) + firstName[1..];

        return Task.FromResult<GetDashboardResult?>(
            new GetDashboardResult(firstName, stats, upcomingEvents, boardGroups));
    }
}
