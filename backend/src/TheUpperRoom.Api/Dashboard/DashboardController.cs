// traces_to: L2-059
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Contacts;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Kanban;
using TheUpperRoom.Api.Partners;
using TheUpperRoom.Api.Rbac;

namespace TheUpperRoom.Api.Dashboard;

[ApiController]
[Authorize]
[Route("api/v1/dashboard")]
public sealed class DashboardController(ContactsDbContext contactsDb) : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var now = DateTimeOffset.UtcNow;

        var contactCount = ContactsController.StoreCount(user, contactsDb);
        var partnerCount = PartnersController.StoreCount();
        var upcomingEventCount = EventsController.Store
            .Count(e => e.StartAt > now && e.Status != "Cancelled");
        var openIdeaCount = IdeasController.StoreCount();

        var upcomingEvents = EventsController.Store
            .Where(e => e.StartAt > now && e.Status != "Cancelled")
            .OrderBy(e => e.StartAt)
            .Take(5)
            .Select(e => new { id = e.Id, title = e.Title, startAt = e.StartAt.ToString("O"), location = e.Location })
            .ToList();

        var boardGroups = BoardsController.GetMyBoardGroups(user.Id)
            .Select(g => new { boardId = g.BoardId, boardTitle = g.BoardTitle, cards = g.Cards })
            .ToList();

        var firstName = user.Email.Split('@')[0].Split('.')[0];
        firstName = char.ToUpper(firstName[0]) + firstName[1..];

        return Ok(new
        {
            firstName,
            stats = new { contacts = contactCount, partners = partnerCount, upcomingEvents = upcomingEventCount, openIdeas = openIdeaCount },
            upcomingEvents,
            tasksOnMyBoards = boardGroups,
        });
    }

    private SeedUser? GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value ?? "";
        return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user) ? null : user;
    }
}
