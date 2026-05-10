// traces_to: L2-015
// Updated 2026-05-10 (BUG-003 fix): exchange now requires a code issued by
// the dev IdP and resolves a real user; PKCE challenge lives on the stored
// code rather than being passed in the request.
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class ExchangeEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExchangeEndpointTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private sealed record AuthorizeResponse(string Code);

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

    private async Task<string> AuthorizeAsync(HttpClient client, string codeChallenge)
    {
        var resp = await client.PostAsJsonAsync(
            "/__idp/authorize",
            new { email = "admin@test.local", password = "UpperRoomDev!42", codeChallenge });
        var body = await resp.Content.ReadFromJsonAsync<AuthorizeResponse>();
        return body!.Code;
    }

    [Fact]
    public async Task Verifier_mismatch_returns_400()
    {
        var client = _factory.CreateClient();
        var (_, challenge) = NewPkcePair();
        var code = await AuthorizeAsync(client, challenge);

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code, codeVerifier = "wrong-verifier" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Valid_exchange_returns_token_and_strict_cookie()
    {
        var client = _factory.CreateClient();
        var (verifier, challenge) = NewPkcePair();
        var code = await AuthorizeAsync(client, challenge);

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code, codeVerifier = verifier });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var setCookie = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
        Assert.NotNull(setCookie);
        Assert.Contains("tar.refresh=", setCookie);
        Assert.Contains("httponly", setCookie!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", setCookie!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", setCookie!, StringComparison.OrdinalIgnoreCase);
    }
}
