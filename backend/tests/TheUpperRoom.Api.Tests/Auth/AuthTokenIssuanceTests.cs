// Traces to: TASK-0220
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class AuthTokenIssuanceTests : IClassFixture<WebApplicationFactory<Program>>
{
    private const string Verifier = "abc123";
    private const string Challenge = "bKE9UspwyIPg8LsQHkJaiehiTeUdstI5JZOvaoQRgJA";

    private readonly WebApplicationFactory<Program> _factory;

    public AuthTokenIssuanceTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private async Task<(string accessToken, string refreshCookieValue)> ExchangeAsync(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = "auth-code", codeVerifier = Verifier, expectedChallenge = Challenge });
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<ExchangeBody>();
        var setCookie = response.Headers.GetValues("Set-Cookie").First();
        var refreshValue = setCookie.Split(';')[0].Split('=', 2)[1];
        return (body!.accessToken, refreshValue);
    }

    private sealed record ExchangeBody(string accessToken);

    [Fact]
    public async Task Access_token_is_not_the_legacy_literal()
    {
        var (token, _) = await ExchangeAsync(_factory.CreateClient());
        Assert.False(string.IsNullOrEmpty(token));
        Assert.NotEqual("fake-access-token", token);
    }

    [Fact]
    public async Task Refresh_cookie_is_not_the_legacy_literal()
    {
        var (_, refresh) = await ExchangeAsync(_factory.CreateClient());
        Assert.False(string.IsNullOrEmpty(refresh));
        Assert.NotEqual("fake-refresh-token", refresh);
    }

    [Fact]
    public async Task Access_token_is_a_jwt_with_sub_iat_exp_claims()
    {
        var (token, _) = await ExchangeAsync(_factory.CreateClient());
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        Assert.NotNull(jwt.Claims.FirstOrDefault(c => c.Type == "sub"));
        Assert.NotNull(jwt.Claims.FirstOrDefault(c => c.Type == "iat"));
        Assert.NotNull(jwt.Claims.FirstOrDefault(c => c.Type == "exp"));
    }

    [Fact]
    public async Task Access_token_signature_validates_against_configured_key()
    {
        var (token, _) = await ExchangeAsync(_factory.CreateClient());
        var settings = _factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.JwtSettings>();
        var keyBytes = Encoding.UTF8.GetBytes(settings.SigningKey);
        var handler = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = false,
        };
        handler.ValidateToken(token, parameters, out _);
    }

    [Fact]
    public async Task Two_exchanges_yield_distinct_access_tokens()
    {
        var (a, _) = await ExchangeAsync(_factory.CreateClient());
        await Task.Delay(1100);
        var (b, _) = await ExchangeAsync(_factory.CreateClient());
        Assert.NotEqual(a, b);
    }
}
