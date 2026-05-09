// traces_to: L2-034, L2-035, L2-077
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Api.Partners;

[ApiController]
[Authorize]
[Route("api/v1/partners")]
public sealed class PartnersController(
    ICurrentUser currentUser,
    IUserDirectory userDirectory) : ControllerBase
{
    private static readonly List<PartnerDto> _store =
    [
        new("p-seed", "Grace Church", "https://grace.org", "Toronto", 3,
            [new("t-vip", "VIP", "purple")], false)
    ];

    internal static int StoreCount() => _store.Count(p => !p.Archived);

    internal static IEnumerable<PartnerDto> Search(string term) =>
        _store.Where(p => !p.Archived && p.Name.Contains(term, StringComparison.OrdinalIgnoreCase));

    [HttpGet]
    public IActionResult List(
        [FromQuery] string? search,
        [FromQuery] bool? archived)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        IEnumerable<PartnerDto> items = user.Role == Roles.SystemAdmin
            ? _store
            : _store.Where(p => p.CityId == user.City);

        if (!string.IsNullOrEmpty(search))
            items = items.Where(p => p.Name.Contains(search, StringComparison.OrdinalIgnoreCase));

        if (archived.HasValue)
            items = items.Where(p => p.Archived == archived.Value);
        else
            items = items.Where(p => !p.Archived);

        var result = items.ToArray();
        return Ok(new { items = result, total = result.Length });
    }

    [HttpGet("{id}")]
    public ActionResult<PartnerDto> GetById(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var partner = _store.FirstOrDefault(p => p.Id == id);
        if (partner is null) return NotFound();

        if (user.Role != Roles.SystemAdmin && partner.CityId != user.City) return NotFound();

        return Ok(partner);
    }

    [HttpPost]
    public ActionResult<PartnerDto> Create([FromBody] CreatePartnerRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Name)) return BadRequest();

        var sameCityName = _store.Any(p =>
            p.CityId == user.City &&
            p.Name.Equals(body.Name, StringComparison.OrdinalIgnoreCase));

        if (sameCityName)
            return Conflict(new { error = "A partner with this name already exists in your city." });

        var id = Guid.NewGuid().ToString("N")[..8];
        var partner = new PartnerDto(id, body.Name, body.Website, user.City, 0, [], false);
        _store.Add(partner);
        return Created($"/api/v1/partners/{id}", partner);
    }

    [HttpPut("{id}")]
    public ActionResult<PartnerDto> Update(string id, [FromBody] CreatePartnerRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null || string.IsNullOrWhiteSpace(body.Name)) return BadRequest();

        var partner = _store.FirstOrDefault(p => p.Id == id);
        if (partner is null) return NotFound();
        if (user.Role != Roles.SystemAdmin && partner.CityId != user.City) return NotFound();

        var sameCityName = _store.Any(p =>
            p.Id != id &&
            p.CityId == partner.CityId &&
            p.Name.Equals(body.Name, StringComparison.OrdinalIgnoreCase));

        if (sameCityName)
            return Conflict(new { error = "A partner with this name already exists in your city." });

        var updated = partner with { Name = body.Name, Website = body.Website, SocialLinks = body.SocialLinks };
        var idx = _store.IndexOf(partner);
        _store[idx] = updated;
        return Ok(updated);
    }

    [HttpPatch("{id}")]
    public ActionResult<PartnerDto> Patch(string id, [FromBody] PatchPartnerRequest? body)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();
        if (body is null) return BadRequest();

        var partner = _store.FirstOrDefault(p => p.Id == id);
        if (partner is null) return NotFound();
        if (user.Role != Roles.SystemAdmin && partner.CityId != user.City) return NotFound();

        var updated = partner with { Archived = body.Archived };
        var idx = _store.IndexOf(partner);
        _store[idx] = updated;
        return Ok(updated);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        var user = GetCurrentUser();
        if (user is null) return Unauthorized();

        var partner = _store.FirstOrDefault(p => p.Id == id);
        if (partner is null) return NotFound();
        if (user.Role != Roles.SystemAdmin && partner.CityId != user.City) return NotFound();

        _store.Remove(partner);
        return NoContent();
    }

    private AppUser? GetCurrentUser() =>
        userDirectory.GetById(currentUser.UserId ?? "");
}
