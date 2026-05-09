// traces_to: L2-092
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class SecurityHeadersTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SecurityHeadersTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Theory]
    [InlineData("X-Content-Type-Options", "nosniff")]
    [InlineData("Referrer-Policy", "strict-origin-when-cross-origin")]
    [InlineData("X-Frame-Options", "DENY")]
    [InlineData("Cross-Origin-Opener-Policy", "same-origin")]
    [InlineData("Permissions-Policy", "camera=(), microphone=(), geolocation=()")]
    public async Task Security_header_present_with_correct_value(string header, string expectedValue)
    {
        var client = _factory.CreateClient(new() { AllowAutoRedirect = false });
        var resp = await client.GetAsync("/api/v1/health");

        Assert.True(resp.Headers.TryGetValues(header, out var values) ||
                    resp.Content.Headers.TryGetValues(header, out values),
            $"Header '{header}' not found");
        Assert.Contains(expectedValue, string.Join(",", values ?? []));
    }

    [Fact]
    public async Task Strict_Transport_Security_header_present()
    {
        var client = _factory.CreateClient(new() { AllowAutoRedirect = false });
        var resp = await client.GetAsync("/api/v1/health");

        Assert.True(resp.Headers.TryGetValues("Strict-Transport-Security", out var values),
            "Strict-Transport-Security header not found");
        var value = string.Join(",", values ?? []);
        Assert.Contains("max-age=", value);
    }

    [Fact]
    public async Task Content_Security_Policy_header_present()
    {
        var client = _factory.CreateClient(new() { AllowAutoRedirect = false });
        var resp = await client.GetAsync("/api/v1/health");

        Assert.True(resp.Headers.TryGetValues("Content-Security-Policy", out var values) ||
                    resp.Content.Headers.TryGetValues("Content-Security-Policy", out values),
            "Content-Security-Policy header not found");
        var value = string.Join(",", values ?? []);
        Assert.Contains("default-src", value);
    }
}
