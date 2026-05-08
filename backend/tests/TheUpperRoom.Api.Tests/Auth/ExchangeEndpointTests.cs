// traces_to: L2-015
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class ExchangeEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ExchangeEndpointTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Verifier_mismatch_returns_400()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = "abc", codeVerifier = "wrong", expectedChallenge = "challenge-abc" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Valid_exchange_returns_token_and_strict_cookie()
    {
        var client = _factory.CreateClient();

        // Verifier "abc123" hashed with S256 base64url:
        //   echo -n abc123 | openssl dgst -binary -sha256 | openssl base64 -A
        // Then '+' -> '-', '/' -> '_', strip '=' padding.
        const string verifier = "abc123";
        const string challenge = "bKE9UspwyIPg8LsQHkJaiehiTeUdstI5JZOvaoQRgJA";

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/exchange",
            new { code = "auth-code", codeVerifier = verifier, expectedChallenge = challenge });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var setCookie = response.Headers.GetValues("Set-Cookie").FirstOrDefault();
        Assert.NotNull(setCookie);
        Assert.Contains("tar.refresh=", setCookie);
        Assert.Contains("httponly", setCookie!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", setCookie!, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", setCookie!, StringComparison.OrdinalIgnoreCase);
    }
}
