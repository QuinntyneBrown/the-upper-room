// traces_to: L2-059
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Dashboard;

namespace TheUpperRoom.Api.Dashboard;

[ApiController]
[Authorize]
[Route("api/v1/dashboard")]
public sealed class DashboardController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetDashboardQuery(currentUser.UserId ?? ""), cancellationToken);
        if (result is null) return Unauthorized();
        return Ok(new
        {
            firstName = result.FirstName,
            stats = new
            {
                contacts = result.Stats.Contacts,
                partners = result.Stats.Partners,
                upcomingEvents = result.Stats.UpcomingEvents,
                openIdeas = result.Stats.OpenIdeas,
            },
            upcomingEvents = result.UpcomingEvents.Select(e => new
            {
                id = e.Id,
                title = e.Title,
                startAt = e.StartAt,
                location = e.Location,
            }).ToList(),
            tasksOnMyBoards = result.TasksOnMyBoards.Select(g => new
            {
                boardId = g.BoardId,
                boardTitle = g.BoardTitle,
                cards = g.Cards,
            }).ToList(),
        });
    }
}
