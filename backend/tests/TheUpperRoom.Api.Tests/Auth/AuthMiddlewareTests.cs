// Traces to: TASK-0221
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class AuthMiddlewareTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthMiddlewareTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private string IssueToken(string subject)
    {
        var tokens = _factory.Services.GetRequiredService<ITokenService>();
        return tokens.IssueAccessToken(subject);
    }

    private static string IssueWithKey(string signingKey, string subject, DateTime expires)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: "the-upper-room",
            audience: "the-upper-room",
            claims: new[] { new Claim(JwtRegisteredClaimNames.Sub, subject) },
            notBefore: DateTime.UtcNow.AddMinutes(-5),
            expires: expires,
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Fact]
    public async Task Bearer_token_resolves_HttpContext_User_with_matching_sub()
    {
        var client = _factory.CreateClient();
        var token = IssueToken("user-42");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<MeResponse>();
        Assert.Equal("user-42", body!.userId);
    }

    [Fact]
    public async Task Authorize_endpoint_without_bearer_returns_401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Token_signed_with_different_key_returns_401()
    {
        var client = _factory.CreateClient();
        var token = IssueWithKey(
            "a-completely-different-key-32-bytes-long-min-test",
            "user-1",
            DateTime.UtcNow.AddMinutes(15));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Expired_token_returns_401()
    {
        var client = _factory.CreateClient();
        var settings = _factory.Services.GetRequiredService<JwtSettings>();
        var token = IssueWithKey(settings.SigningKey, "user-1", DateTime.UtcNow.AddMinutes(-1));
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ICurrentUser_returns_same_id_as_resolved_principal()
    {
        var client = _factory.CreateClient();
        var token = IssueToken("user-99");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/v1/auth/me");
        var body = await response.Content.ReadFromJsonAsync<MeResponse>();
        Assert.Equal("user-99", body!.currentUserId);
        Assert.Equal(body.userId, body.currentUserId);
    }

    private sealed record MeResponse(string userId, string currentUserId);
}
