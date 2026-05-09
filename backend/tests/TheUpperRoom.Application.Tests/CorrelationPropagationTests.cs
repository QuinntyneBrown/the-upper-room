// traces_to: L2-097, TASK-0232
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace TheUpperRoom.Application.Tests;

public sealed class CorrelationPropagationTests
{
    [Fact]
    public async Task All_logs_during_request_share_correlation_id()
    {
        var sink = new TestLogSink();
        await using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                logging.AddProvider(sink);
            }));
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken("admin");
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var correlationId = "corr-" + Guid.NewGuid().ToString("N")[..12];
        await client.SendAsync(new HttpRequestMessage(HttpMethod.Get, "/api/v1/health")
        {
            Headers = { { "X-Correlation-Id", correlationId } },
        });

        var matched = sink.Entries
            .Where(entry => entry.Scopes.Any(scope =>
                scope.TryGetValue("CorrelationId", out var value)
                && value?.ToString() == correlationId))
            .ToList();

        Assert.NotEmpty(matched);
        Assert.All(matched, entry =>
        {
            var scope = Assert.Single(entry.Scopes, scope => scope.ContainsKey("CorrelationId"));
            Assert.Equal(correlationId, scope["CorrelationId"]?.ToString());
        });
    }
}
