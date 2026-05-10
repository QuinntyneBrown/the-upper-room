// traces_to: L2-036
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api.Partners;

[ApiController]
[Route("api/v1/partners/{partnerId}/contacts")]
public sealed class PartnerContactsController : ControllerBase
{
    private static readonly List<(string PartnerId, LinkedContactDto Contact)> _links = [];

    [HttpGet]
    public IActionResult List(string partnerId)
    {
        var items = _links
            .Where(l => l.PartnerId == partnerId)
            .Select(l => l.Contact)
            .ToArray();
        return Ok(new { items, total = items.Length });
    }

    [HttpPost]
    public IActionResult Link(string partnerId, [FromBody] LinkContactRequest? body)
    {
        if (body is null || string.IsNullOrWhiteSpace(body.ContactId)) return BadRequest();

        var already = _links.Any(l => l.PartnerId == partnerId && l.Contact.Id == body.ContactId);
        if (already)
            return Conflict(new { error = "Contact is already linked to this partner." });

        var contact = new LinkedContactDto(body.ContactId, $"Contact {body.ContactId}", "Unknown", body.Role);
        _links.Add((partnerId, contact));
        return StatusCode(201, new { contactId = body.ContactId, role = body.Role ?? "" });
    }

    [HttpDelete("{contactId}")]
    public IActionResult Unlink(string partnerId, string contactId)
    {
        var idx = _links.FindIndex(l => l.PartnerId == partnerId && l.Contact.Id == contactId);
        if (idx < 0) return NotFound();
        _links.RemoveAt(idx);
        return NoContent();
    }
}
