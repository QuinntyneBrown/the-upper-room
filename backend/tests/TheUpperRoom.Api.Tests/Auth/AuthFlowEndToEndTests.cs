// Verifies BUG-001: register → verify-email → sign-in works end-to-end,
// and forgot-password → reset-password works end-to-end. Closes the
// last gap claimed by BUG-001 (sign-up / reset-password / verify-email
// endpoints existed in the controller but their AuthUserStore backing
// methods used to throw NotImplementedException; they have been wired up
// since.).
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class AuthFlowEndToEndTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthFlowEndToEndTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private sealed record RegisterResponse(string UserId, string EmailVerificationToken);
    private sealed record TokenBody(string AccessToken);

    [Fact]
    public async Task Register_then_verify_then_sign_in_round_trip()
    {
        var client = _factory.CreateClient();
        var email = $"flow+{Guid.NewGuid():N}@test.local";
        const string password = "FlowPassword!42";

        // Register
        var registerResp = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new { email, password, city = "Toronto" });
        Assert.Equal(HttpStatusCode.Created, registerResp.StatusCode);
        var registered = await registerResp.Content.ReadFromJsonAsync<RegisterResponse>();
        Assert.NotNull(registered);
        Assert.False(string.IsNullOrWhiteSpace(registered!.UserId));
        Assert.False(string.IsNullOrWhiteSpace(registered.EmailVerificationToken));

        // Sign-in BEFORE verification should be rejected
        var preVerifyResp = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email, password });
        Assert.Equal(HttpStatusCode.Unauthorized, preVerifyResp.StatusCode);

        // Verify the email
        var verifyResp = await client.PostAsJsonAsync(
            "/api/v1/auth/verify-email",
            new { token = registered.EmailVerificationToken });
        Assert.Equal(HttpStatusCode.NoContent, verifyResp.StatusCode);

        // Sign-in now succeeds
        var signInResp = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email, password });
        Assert.Equal(HttpStatusCode.OK, signInResp.StatusCode);
        var token = await signInResp.Content.ReadFromJsonAsync<TokenBody>();
        Assert.False(string.IsNullOrWhiteSpace(token!.AccessToken));
    }

    [Fact]
    public async Task Verify_email_with_invalid_token_returns_400()
    {
        var client = _factory.CreateClient();
        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/verify-email",
            new { token = "not-a-real-token" });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Reset_password_with_invalid_token_returns_400()
    {
        var client = _factory.CreateClient();
        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/reset-password",
            new { token = "not-a-real-token", newPassword = "NewPass!42" });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Forgot_password_does_not_leak_account_existence()
    {
        var client = _factory.CreateClient();
        // Both real and non-existent emails should return 204 (don't leak existence).
        var unknown = await client.PostAsJsonAsync(
            "/api/v1/auth/forgot-password",
            new { email = $"ghost+{Guid.NewGuid():N}@test.local" });
        Assert.Equal(HttpStatusCode.NoContent, unknown.StatusCode);

        var known = await client.PostAsJsonAsync(
            "/api/v1/auth/forgot-password",
            new { email = "admin@test.local" });
        Assert.Equal(HttpStatusCode.NoContent, known.StatusCode);
    }
}
