// Verifies BUG-003: the PKCE exchange now issues a JWT whose `sub` claim is
// the real user id (resolved from the dev IdP's authorize call), not the
// stale literal "anonymous".
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class PkceExchangeRoundTripTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public PkceExchangeRoundTripTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private sealed record AuthorizeResponse(string Code);
    private sealed record ExchangeResponse(string AccessToken);
    private sealed record MeResponse(string UserId, string CurrentUserId);

    private static (string verifier, string challenge) NewPkcePair()
    {
        var verifierBytes = RandomNumberGenerator.GetBytes(32);
        var verifier = Convert.ToBase64String(verifierBytes)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        var hash = SHA256.HashData(Encoding.ASCII.GetBytes(verifier));
        var challenge = Convert.ToBase64String(hash)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        return (verifier, challenge);
    }

    [Fact]
    public async Task Authorize_then_exchange_issues_token_with_real_user_sub()
    {
        var client = _factory.CreateClient();
        var (verifier, challenge) = NewPkcePair();

        var authorize = await client.PostAsJsonAsync(
            "/__idp/authorize",
            new { email = "admin@test.local", password = "UpperRoomDev!42", codeChallenge = challenge });
        Assert.Equal(HttpStatusCode.OK, authorize.StatusCode);
        var authorized = await authorize.Content.ReadFromJsonAsync<AuthorizeResponse>();
        Assert.NotNull(authorized);
        Assert.False(string.IsNullOrWhiteSpace(authorized!.Code));

        var exchange = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = authorized.Code, codeVerifier = verifier });
        Assert.Equal(HttpStatusCode.OK, exchange.StatusCode);
        var token = await exchange.Content.ReadFromJsonAsync<ExchangeResponse>();
        Assert.False(string.IsNullOrWhiteSpace(token!.AccessToken));

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token.AccessToken);
        var sub = jwt.Subject;
        Assert.Equal("admin", sub);
        Assert.NotEqual("anonymous", sub);

        // The token actually authenticates a real authorized request.
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
        var me = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        var meBody = await me.Content.ReadFromJsonAsync<MeResponse>();
        Assert.Equal("admin", meBody!.UserId);
    }

    [Fact]
    public async Task Exchange_with_unknown_code_returns_400()
    {
        var client = _factory.CreateClient();

        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = "not-a-real-code", codeVerifier = "anything" });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Exchange_with_wrong_verifier_returns_400()
    {
        var client = _factory.CreateClient();
        var (_, challenge) = NewPkcePair();

        var authorize = await client.PostAsJsonAsync(
            "/__idp/authorize",
            new { email = "admin@test.local", password = "UpperRoomDev!42", codeChallenge = challenge });
        var authorized = await authorize.Content.ReadFromJsonAsync<AuthorizeResponse>();

        // Use a different verifier than the one whose hash matches the challenge.
        var (wrongVerifier, _) = NewPkcePair();
        var resp = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = authorized!.Code, codeVerifier = wrongVerifier });
        Assert.Equal(HttpStatusCode.BadRequest, resp.StatusCode);
    }

    [Fact]
    public async Task Code_is_single_use_second_exchange_attempts_fail()
    {
        var client = _factory.CreateClient();
        var (verifier, challenge) = NewPkcePair();

        var authorize = await client.PostAsJsonAsync(
            "/__idp/authorize",
            new { email = "admin@test.local", password = "UpperRoomDev!42", codeChallenge = challenge });
        var authorized = await authorize.Content.ReadFromJsonAsync<AuthorizeResponse>();

        var first = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = authorized!.Code, codeVerifier = verifier });
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = authorized.Code, codeVerifier = verifier });
        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
    }
}
