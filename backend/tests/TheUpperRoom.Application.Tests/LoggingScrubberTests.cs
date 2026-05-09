// traces_to: L2-097
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class LoggingScrubberTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private static readonly string[] SensitiveWords =
        ["password", "secret", "code_verifier", "Authorization", "Cookie", "test-token-do-not-log"];

    public LoggingScrubberTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Log_entries_do_not_contain_sensitive_field_names_or_values()
    {
        var client = _factory.CreateClient();
        var correlationId = "scrub-test-" + Guid.NewGuid().ToString("N")[..8];

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Get, "/api/v1/health")
        {
            Headers =
            {
                { "X-Correlation-Id", correlationId },
                { "Authorization", "Bearer test-token-do-not-log" },
                { "Cookie", "session=abc123" },
            },
        });

        var resp = await client.GetAsync($"/api/v1/test/logs?correlationId={correlationId}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var logs = await resp.Content.ReadFromJsonAsync<LogEntryDto[]>() ?? [];

        foreach (var entry in logs)
        {
            foreach (var word in SensitiveWords)
            {
                Assert.DoesNotContain(word, entry.Message, StringComparison.OrdinalIgnoreCase);
                if (entry.Properties is not null)
                    Assert.All(entry.Properties.Values,
                        v => Assert.DoesNotContain(word, v, StringComparison.OrdinalIgnoreCase));
            }
        }
    }

    private sealed record LogEntryDto(
        string Level, string Message,
        Dictionary<string, string>? Properties,
        DateTimeOffset Timestamp);
}
