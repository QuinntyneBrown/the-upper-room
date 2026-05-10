// traces_to: L2-015, L2-094
using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Audit;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Api.Auth;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IPkceVerifier _verifier;
    private readonly ITokenService _tokens;
    private readonly IMediator _mediator;
    private readonly IAuthRateLimiter _rateLimiter;

    public AuthController(
        IPkceVerifier verifier,
        ITokenService tokens,
        IMediator mediator,
        IAuthRateLimiter rateLimiter)
    {
        _verifier = verifier;
        _tokens = tokens;
        _mediator = mediator;
        _rateLimiter = rateLimiter;
    }

    [HttpPost("sign-in")]
    public async Task<IActionResult> SignIn([FromBody] SignInRequest? body, CancellationToken cancellationToken)
    {
        if (body?.Email is null) return BadRequest();

        var now = DateTimeOffset.UtcNow;
        if (await _rateLimiter.IsSignInLockedAsync(body.Email, now, cancellationToken))
        {
            Response.Headers["Retry-After"] = "1800";
            AuditStore.Record(body.Email, "Session", "sign-in", "Locked", afterJson: AuditMetadata());
            return StatusCode(429, new { error = "rate_limit_exceeded" });
        }

        var result = await _mediator.Send(new SignInCommand(body.Email, body.Password), cancellationToken);
        if (result.Outcome != SignInOutcome.Success || result.UserId is null)
        {
            if (await _rateLimiter.RecordFailedSignInAsync(body.Email, DateTimeOffset.UtcNow, cancellationToken))
            {
                Response.Headers["Retry-After"] = "1800";
                AuditStore.Record(body.Email, "Session", "sign-in", "Locked", afterJson: AuditMetadata());
                return StatusCode(429, new { error = "rate_limit_exceeded" });
            }

            AuditStore.Record(body.Email, "Session", "sign-in", "Failure", afterJson: AuditMetadata());
            return Unauthorized(new { code = "auth.invalid_credentials" });
        }

        await _rateLimiter.ClearSignInAsync(body.Email, cancellationToken);

        AuditStore.Record(result.UserId, "Session", "sign-in", "Success", afterJson: AuditMetadata());
        Response.Cookies.Append("tar.refresh", _tokens.IssueRefreshToken(), new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth"
        });

        return Ok(new ExchangeResponse(_tokens.IssueAccessToken(result.UserId)));
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequest? body,
        CancellationToken cancellationToken)
    {
        if (body?.Email is null) return BadRequest();

        var accepted = await _rateLimiter.TryRecordForgotPasswordAsync(
            body.Email,
            DateTimeOffset.UtcNow,
            cancellationToken);
        if (!accepted)
        {
            return StatusCode(429, new { error = "rate_limit_exceeded" });
        }

        return NoContent();
    }

    [HttpPost("sign-out")]
    [RequireXsrf]
    public new IActionResult SignOut()
    {
        Response.Cookies.Delete("tar.refresh", new CookieOptions { Path = "/api/v1/auth" });
        return NoContent();
    }

    [HttpPost("exchange")]
    public ActionResult<ExchangeResponse> Exchange(ExchangeRequest req)
    {
        if (!_verifier.Verify(req.CodeVerifier, req.ExpectedChallenge))
        {
            AuditStore.Record("anonymous", "Session", "exchange", "Failure", afterJson: AuditMetadata());
            return BadRequest(new { code = "auth.invalid_credentials" });
        }

        var auditMetadata = AuditMetadata();
        AuditStore.Record("anonymous", "Session", "exchange", "Login", afterJson: auditMetadata);
        AuditStore.Record("anonymous", "Session", "exchange", "Success", afterJson: auditMetadata);

        Response.Cookies.Append("tar.refresh", _tokens.IssueRefreshToken(), new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth"
        });

        return Ok(new ExchangeResponse(_tokens.IssueAccessToken("anonymous")));
    }

    private string AuditMetadata() =>
        JsonSerializer.Serialize(new
        {
            ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        });
}

public sealed record SignInRequest(string Email, string? Password);
public sealed record ForgotPasswordRequest(string Email);
