// traces_to: L2-096
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class CsrfTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CsrfTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task POST_cookie_endpoint_without_XSRF_token_returns_403()
    {
        var client = _factory.CreateClient();

        var resp = await client.PostAsJsonAsync("/api/v1/auth/sign-out", new { });

        Assert.Equal(HttpStatusCode.Forbidden, resp.StatusCode);
        var body = await resp.Content.ReadFromJsonAsync<Dictionary<string, string>>();
        Assert.Equal("csrf.invalid", body?["code"]);
    }

    [Fact]
    public async Task POST_bearer_endpoint_without_XSRF_token_succeeds()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin"));

        var resp = await client.PostAsJsonAsync("/api/v1/notifications/read-all", new { });

        Assert.NotEqual(HttpStatusCode.Forbidden, resp.StatusCode);
    }
}
