// traces_to: L2-015, L2-094
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Audit;

namespace TheUpperRoom.Api.Auth;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    // In-memory rate limit buckets keyed by email
    private static readonly Dictionary<string, SignInBucket> _signInBuckets = new(StringComparer.OrdinalIgnoreCase);
    private static readonly Dictionary<string, ForgotBucket> _forgotBuckets = new(StringComparer.OrdinalIgnoreCase);

    private readonly IPkceVerifier _verifier;

    public AuthController(IPkceVerifier verifier) => _verifier = verifier;

    [HttpPost("sign-in")]
    public IActionResult SignIn([FromBody] SignInRequest? body)
    {
        if (body?.Email is null) return BadRequest();

        lock (_signInBuckets)
        {
            if (!_signInBuckets.TryGetValue(body.Email, out var bucket))
                bucket = _signInBuckets[body.Email] = new SignInBucket();

            if (bucket.IsLocked(DateTimeOffset.UtcNow))
            {
                Response.Headers["Retry-After"] = "1800";
                return StatusCode(429, new { error = "rate_limit_exceeded" });
            }

            bucket.Record(DateTimeOffset.UtcNow);

            if (bucket.AttemptCount >= 5)
            {
                bucket.LockUntil = DateTimeOffset.UtcNow.AddMinutes(30);
                Response.Headers["Retry-After"] = "1800";
                return StatusCode(429, new { error = "rate_limit_exceeded" });
            }
        }

        return Unauthorized(new { code = "auth.invalid_credentials" });
    }

    [HttpPost("forgot-password")]
    public IActionResult ForgotPassword([FromBody] ForgotPasswordRequest? body)
    {
        if (body?.Email is null) return BadRequest();

        lock (_forgotBuckets)
        {
            if (!_forgotBuckets.TryGetValue(body.Email, out var bucket))
                bucket = _forgotBuckets[body.Email] = new ForgotBucket();

            bucket.Purge(DateTimeOffset.UtcNow);

            if (bucket.Count >= 3)
                return StatusCode(429, new { error = "rate_limit_exceeded" });

            bucket.Record(DateTimeOffset.UtcNow);
        }

        return NoContent();
    }

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

    private sealed class SignInBucket
    {
        public int AttemptCount { get; private set; }
        public DateTimeOffset? LockUntil { get; set; }
        private DateTimeOffset _windowStart = DateTimeOffset.UtcNow;

        public bool IsLocked(DateTimeOffset now) => LockUntil.HasValue && now < LockUntil.Value;

        public void Record(DateTimeOffset now)
        {
            if (now - _windowStart > TimeSpan.FromMinutes(15)) { AttemptCount = 0; _windowStart = now; }
            AttemptCount++;
        }
    }

    private sealed class ForgotBucket
    {
        private readonly List<DateTimeOffset> _times = [];
        public int Count => _times.Count;
        public void Purge(DateTimeOffset now) => _times.RemoveAll(t => now - t > TimeSpan.FromHours(1));
        public void Record(DateTimeOffset now) => _times.Add(now);
    }
}

public sealed record SignInRequest(string Email, string? Password);
public sealed record ForgotPasswordRequest(string Email);
