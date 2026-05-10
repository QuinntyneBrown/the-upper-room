// traces_to: L2-093
using Ganss.Xss;
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api.Sanitization;

[ApiController]
[Route("api/v1/sanitize")]
public sealed class SanitizeController : ControllerBase
{
    private static readonly HtmlSanitizer _sanitizer = new();

    [HttpPost("test")]
    public IActionResult Sanitize([FromBody] SanitizeRequest? body)
    {
        if (body is null) return BadRequest();
        return Ok(new { Html = _sanitizer.Sanitize(body.Html ?? "") });
    }
}
