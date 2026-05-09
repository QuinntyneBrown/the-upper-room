// traces_to: L2-094
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

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
}
