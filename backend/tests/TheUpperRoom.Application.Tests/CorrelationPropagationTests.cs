// traces_to: L2-097
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class CorrelationPropagationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CorrelationPropagationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task All_logs_during_request_share_correlation_id()
    {
        var client = _factory.CreateClient();
        var correlationId = "corr-" + Guid.NewGuid().ToString("N")[..12];

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Get, "/api/v1/health")
        {
            Headers = { { "X-Correlation-Id", correlationId } },
        });

        var resp = await client.GetAsync($"/api/v1/test/logs?correlationId={correlationId}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        var logs = await resp.Content.ReadFromJsonAsync<LogEntryDto[]>() ?? [];

        Assert.NotEmpty(logs);
        Assert.All(logs, entry =>
        {
            Assert.NotNull(entry.Properties);
            Assert.True(entry.Properties.TryGetValue("CorrelationId", out var v));
            Assert.Equal(correlationId, v);
        });
    }

    private sealed record LogEntryDto(
        string Level, string Message,
        Dictionary<string, string>? Properties,
        DateTimeOffset Timestamp);
}
