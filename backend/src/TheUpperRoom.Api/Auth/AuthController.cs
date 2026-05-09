// traces_to: L2-015
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Audit;

namespace TheUpperRoom.Api.Auth;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IPkceVerifier _verifier;

    public AuthController(IPkceVerifier verifier) => _verifier = verifier;

    [HttpPost("exchange")]
    public ActionResult<ExchangeResponse> Exchange(ExchangeRequest req)
    {
        if (!_verifier.Verify(req.CodeVerifier, req.ExpectedChallenge))
        {
            return BadRequest(new { code = "auth.invalid_credentials" });
        }

        AuditStore.Record("anonymous", "Session", "exchange", "Login");

        Response.Cookies.Append("tar.refresh", "fake-refresh-token", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth"
        });

        return Ok(new ExchangeResponse("fake-access-token"));
    }
}
