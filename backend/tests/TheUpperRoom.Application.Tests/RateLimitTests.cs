// traces_to: L2-094
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Application.Tests;

public sealed class RateLimitTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public RateLimitTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Sixth_sign_in_attempt_returns_429_with_RetryAfter()
    {
        var client = _factory.CreateClient();
        var email = $"rl-{Guid.NewGuid():N}@test.com";
        var payload = new { email, password = "wrong" };

        for (var i = 0; i < 5; i++)
            await client.PostAsJsonAsync("/api/v1/auth/sign-in", payload);

        var resp = await client.PostAsJsonAsync("/api/v1/auth/sign-in", payload);

        Assert.Equal(HttpStatusCode.TooManyRequests, resp.StatusCode);
        Assert.True(resp.Headers.TryGetValues("Retry-After", out var values));
        Assert.Equal("1800", values.FirstOrDefault());

        using var auditRequest = new HttpRequestMessage(
            HttpMethod.Get,
            $"/api/v1/admin/audit?actor={Uri.EscapeDataString(email)}&entityType=Session&action=Locked");
        auditRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin"));

        var auditResponse = await client.SendAsync(auditRequest);
        Assert.Equal(HttpStatusCode.OK, auditResponse.StatusCode);

        var audit = await auditResponse.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(audit);
        Assert.Contains(audit.Items, entry =>
            entry.EntityId == "sign-in" &&
            entry.AfterJson?.Contains("ip", StringComparison.OrdinalIgnoreCase) == true);
    }

    [Fact]
    public async Task Fourth_forgot_password_in_hour_returns_429()
    {
        var client = _factory.CreateClient();
        var email = $"fp-{Guid.NewGuid():N}@test.com";
        var payload = new { email };

        for (var i = 0; i < 3; i++)
            await client.PostAsJsonAsync("/api/v1/auth/forgot-password", payload);

        var resp = await client.PostAsJsonAsync("/api/v1/auth/forgot-password", payload);

        Assert.Equal(HttpStatusCode.TooManyRequests, resp.StatusCode);
    }

    [Fact]
    public async Task Sign_in_lockout_releases_after_window()
    {
        var limiter = _factory.Services.GetRequiredService<IAuthRateLimiter>();
        var email = $"release-{Guid.NewGuid():N}@test.com";
        var now = DateTimeOffset.UtcNow;

        for (var i = 0; i < 5; i++)
        {
            var locked = await limiter.RecordFailedSignInAsync(email, now.AddSeconds(i));
            Assert.False(locked);
        }

        Assert.True(await limiter.RecordFailedSignInAsync(email, now.AddSeconds(5)));
        Assert.True(await limiter.IsSignInLockedAsync(email, now.AddMinutes(5)));
        Assert.False(await limiter.IsSignInLockedAsync(email, now.AddMinutes(31)));
        Assert.False(await limiter.RecordFailedSignInAsync(email, now.AddMinutes(31).AddSeconds(1)));
    }

    private sealed record AuditEntryDto(
        string Id,
        DateTimeOffset Timestamp,
        string ActorUserId,
        string EntityType,
        string EntityId,
        string Action,
        string? BeforeJson,
        string? AfterJson);

    private sealed record AuditEnvelope(AuditEntryDto[] Items, int Total, int Page, int PageSize);
}
