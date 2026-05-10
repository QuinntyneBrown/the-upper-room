// traces_to: L2-098
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Audit;

namespace TheUpperRoom.Api.Audit;

[ApiController]
[Authorize]
[Route("api/v1/admin/audit")]
public sealed class AuditController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? actor,
        [FromQuery] string? entityType,
        [FromQuery] string? action,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new ListAuditEntriesQuery(
            currentUser.UserId ?? "", actor, entityType, action, from, to, page, pageSize),
            cancellationToken);

        return result.Outcome switch
        {
            ListAuditEntriesOutcome.Unauthorized => Unauthorized(),
            ListAuditEntriesOutcome.Forbidden => StatusCode(403, new { error = "Forbidden" }),
            ListAuditEntriesOutcome.Ok => Ok(new { items = result.Items, total = result.Total, page = result.Page, pageSize = result.PageSize }),
            _ => StatusCode(500),
        };
    }
}
