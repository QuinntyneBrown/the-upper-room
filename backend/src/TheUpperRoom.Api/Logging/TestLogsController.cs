// traces_to: L2-097
using Microsoft.AspNetCore.Mvc;
using Serilog.Events;

namespace TheUpperRoom.Api.Logging;

[ApiController]
[Route("api/v1/test")]
public sealed class TestLogsController : ControllerBase
{
    [HttpGet("logs")]
    public IActionResult ListLogs([FromQuery] string? correlationId)
    {
        var entries = InMemorySink.Events
            .Where(e => correlationId == null ||
                (e.Properties.TryGetValue("CorrelationId", out var v) &&
                 v is ScalarValue sv && sv.Value?.ToString() == correlationId))
            .Select(e => new
            {
                Level = e.Level.ToString(),
                Message = e.RenderMessage(),
                Properties = e.Properties.ToDictionary(
                    kv => kv.Key,
                    kv => kv.Value is ScalarValue s ? s.Value?.ToString() ?? "" : kv.Value.ToString()),
                Timestamp = e.Timestamp,
            })
            .ToList();

        return Ok(entries);
    }
}
