// Tiny dev-only Identity Provider used by the local PKCE flow. In production
// the frontend would redirect to a real IdP; this controller stands in so
// developers (and the test harness) can drive the full sign-in -> exchange
// round trip without standing up an external service.
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Api.Auth;

[ApiController]
[Route("__idp")]
public sealed class IdpController(
    IMediator mediator,
    IAuthorizationCodeStore codes) : ControllerBase
{
    /// <summary>
    /// Validates email/password against the real user store. If the credentials
    /// are valid, mints a single-use authorization code bound to the supplied
    /// PKCE <paramref name="body.CodeChallenge"/> and returns it. The frontend
    /// (or test) then posts the code + the matching <c>code_verifier</c> to
    /// <c>/api/v1/auth/exchange</c> to receive an access token whose <c>sub</c>
    /// is the real user id.
    /// </summary>
    [HttpPost("authorize")]
    public async Task<IActionResult> Authorize(
        [FromBody] AuthorizeRequest? body,
        CancellationToken cancellationToken)
    {
        if (body is null) return BadRequest();
        if (string.IsNullOrWhiteSpace(body.CodeChallenge))
            return BadRequest(new { code = "idp.code_challenge_required" });

        var result = await mediator.Send(
            new SignInCommand(body.Email, body.Password),
            cancellationToken);

        if (result.Outcome != SignInOutcome.Success || result.UserId is null)
            return Unauthorized(new { code = "auth.invalid_credentials" });

        var code = codes.Issue(result.UserId, body.CodeChallenge);
        return Ok(new { code });
    }
}
