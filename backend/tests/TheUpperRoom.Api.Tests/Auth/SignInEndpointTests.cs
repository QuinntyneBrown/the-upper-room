// Verifies BUG-002: POST /api/v1/auth/sign-in actually authenticates the seeded
// dev users and returns a usable access token.
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class SignInEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SignInEndpointTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private sealed record TokenBody(string AccessToken);

    [Fact]
    public async Task Sign_in_with_seeded_admin_credentials_returns_200_and_access_token()
    {
        var client = _factory.CreateClient();

        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email = "admin@test.local", password = "UpperRoomDev!42" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<TokenBody>();
        Assert.NotNull(body);
        Assert.False(string.IsNullOrWhiteSpace(body!.AccessToken));
    }

    [Fact]
    public async Task Sign_in_with_wrong_password_returns_401_with_invalid_credentials_code()
    {
        var client = _factory.CreateClient();

        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email = "admin@test.local", password = "wrong-password" });

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("auth.invalid_credentials", json);
    }

    [Fact]
    public async Task Sign_in_with_unknown_email_returns_401()
    {
        var client = _factory.CreateClient();

        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email = "nobody@test.local", password = "anything" });

        Assert.Equal(HttpStatusCode.Unauthorized, resp.StatusCode);
    }
}
