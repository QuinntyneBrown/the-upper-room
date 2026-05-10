// traces_to: L2-015, L2-094
using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
    private readonly ICurrentUser _currentUser;
    private readonly IAuthorizationCodeStore _codes;

    public AuthController(
        IPkceVerifier verifier,
        ITokenService tokens,
        IMediator mediator,
        IAuthRateLimiter rateLimiter,
        ICurrentUser currentUser,
        IAuthorizationCodeStore codes)
    {
        _verifier = verifier;
        _tokens = tokens;
        _mediator = mediator;
        _rateLimiter = rateLimiter;
        _currentUser = currentUser;
        _codes = codes;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest? body,
        CancellationToken cancellationToken)
    {
        if (body is null) return BadRequest();

        var result = await _mediator.Send(
            new RegisterCommand(body.Email, body.Password, body.City),
            cancellationToken);

        return result.Outcome switch
        {
            AuthMutationOutcome.Created => Created(
                $"/api/v1/auth/users/{result.UserId}",
                new
                {
                    userId = result.UserId,
                    emailVerificationToken = result.EmailVerificationToken,
                }),
            AuthMutationOutcome.Conflict => Conflict(new { code = "auth.email_already_registered" }),
            _ => StatusCode(500),
        };
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

        await _mediator.Send(new RequestPasswordResetCommand(body.Email), cancellationToken);
        return NoContent();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequest? body,
        CancellationToken cancellationToken)
    {
        if (body is null) return BadRequest();

        var result = await _mediator.Send(
            new ResetPasswordCommand(body.Token, body.NewPassword),
            cancellationToken);

        return result.Outcome switch
        {
            AuthMutationOutcome.Success => NoContent(),
            AuthMutationOutcome.InvalidToken => BadRequest(new { code = "auth.invalid_or_expired_token" }),
            _ => StatusCode(500),
        };
    }

    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(
        [FromBody] VerifyEmailRequest? body,
        CancellationToken cancellationToken)
    {
        if (body is null) return BadRequest();

        var result = await _mediator.Send(new VerifyEmailCommand(body.Token), cancellationToken);
        return result.Outcome switch
        {
            AuthMutationOutcome.Success => NoContent(),
            AuthMutationOutcome.InvalidToken => BadRequest(new { code = "auth.invalid_or_expired_token" }),
            _ => StatusCode(500),
        };
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest? body,
        CancellationToken cancellationToken)
    {
        if (body is null) return BadRequest();
        if (_currentUser.UserId is null) return Unauthorized();

        var result = await _mediator.Send(
            new ChangePasswordCommand(_currentUser.UserId, body.CurrentPassword, body.NewPassword),
            cancellationToken);

        return result.Outcome switch
        {
            AuthMutationOutcome.Success => NoContent(),
            AuthMutationOutcome.InvalidCredentials => Unauthorized(new { code = "auth.invalid_credentials" }),
            AuthMutationOutcome.NotFound => NotFound(),
            _ => StatusCode(500),
        };
    }

    [Authorize]
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount(
        [FromBody] DeleteAccountRequest? body,
        CancellationToken cancellationToken)
    {
        if (body is null) return BadRequest();
        if (_currentUser.UserId is null) return Unauthorized();

        var result = await _mediator.Send(
            new DeleteAccountCommand(_currentUser.UserId, body.CurrentPassword),
            cancellationToken);

        return result.Outcome switch
        {
            AuthMutationOutcome.Success => DeleteAccountResponse(),
            AuthMutationOutcome.InvalidCredentials => Unauthorized(new { code = "auth.invalid_credentials" }),
            AuthMutationOutcome.NotFound => NotFound(),
            _ => StatusCode(500),
        };
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
        var record = _codes.Consume(req.Code);
        if (record is null)
        {
            AuditStore.Record("anonymous", "Session", "exchange", "Failure", afterJson: AuditMetadata());
            return BadRequest(new { code = "auth.invalid_credentials" });
        }

        if (!_verifier.Verify(req.CodeVerifier, record.CodeChallenge))
        {
            AuditStore.Record(record.UserId, "Session", "exchange", "Failure", afterJson: AuditMetadata());
            return BadRequest(new { code = "auth.invalid_credentials" });
        }

        var auditMetadata = AuditMetadata();
        AuditStore.Record(record.UserId, "Session", "exchange", "Login", afterJson: auditMetadata);
        AuditStore.Record(record.UserId, "Session", "exchange", "Success", afterJson: auditMetadata);

        Response.Cookies.Append("tar.refresh", _tokens.IssueRefreshToken(), new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth"
        });

        return Ok(new ExchangeResponse(_tokens.IssueAccessToken(record.UserId)));
    }

    private string AuditMetadata() =>
        JsonSerializer.Serialize(new
        {
            ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        });

    private IActionResult DeleteAccountResponse()
    {
        Response.Cookies.Delete("tar.refresh", new CookieOptions { Path = "/api/v1/auth" });
        return NoContent();
    }
}

public sealed record SignInRequest(string Email, string? Password);
public sealed record ForgotPasswordRequest(string Email);
