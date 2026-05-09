using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api.Cities;

[ApiController]
[Authorize]
[Route("api/v1/cities")]
public sealed class CitiesController(CitiesDbContext db) : ControllerBase
{
    [HttpGet]
    public IActionResult List()
    {
        var items = db.Cities
            .OrderBy(c => c.Name)
            .Select(c => new { c.Id, c.Name, c.Slug, c.Archived })
            .ToArray();
        return Ok(new { items });
    }
}
