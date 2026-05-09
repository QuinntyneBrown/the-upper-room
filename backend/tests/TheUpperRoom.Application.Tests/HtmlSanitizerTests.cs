// traces_to: L2-093
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class HtmlSanitizerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HtmlSanitizerTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Image_with_onerror_strips_event_handler()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin"));

        var resp = await client.PostAsJsonAsync("/api/v1/sanitize/test",
            new { html = "<img src=x onerror=alert(1)>" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var result = await resp.Content.ReadFromJsonAsync<SanitizeResult>();
        Assert.NotNull(result?.Html);
        Assert.DoesNotContain("onerror", result!.Html);
        Assert.Contains("<img", result.Html);
        Assert.Contains("src", result.Html);
    }

    [Fact]
    public async Task Script_tag_is_removed_completely()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin"));

        var resp = await client.PostAsJsonAsync("/api/v1/sanitize/test",
            new { html = "<script>alert(1)</script>foo" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var result = await resp.Content.ReadFromJsonAsync<SanitizeResult>();
        Assert.DoesNotContain("<script>", result?.Html ?? "");
        Assert.Contains("foo", result?.Html ?? "");
    }

    [Fact]
    public async Task Javascript_href_is_stripped()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin"));

        var resp = await client.PostAsJsonAsync("/api/v1/sanitize/test",
            new { html = "<a href=\"javascript:alert(1)\">x</a>" });

        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var result = await resp.Content.ReadFromJsonAsync<SanitizeResult>();
        Assert.DoesNotContain("javascript:", result?.Html ?? "");
        Assert.Contains("x", result?.Html ?? "");
    }

    private sealed record SanitizeResult(string Html);
}
