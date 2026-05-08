// traces_to: L2-080
using Microsoft.AspNetCore.Mvc;

namespace TheUpperRoom.Api;

[ApiController]
[Route("health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public ActionResult<HealthResponse> Get() => Ok(new HealthResponse("Healthy"));
}
