// traces_to: L2-097, TASK-0232
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using Serilog.Events;

namespace TheUpperRoom.Application.Tests;

public sealed class CorrelationPropagationTests
{
    [Fact]
    public async Task All_logs_during_request_share_correlation_id()
    {
        var sink = new TestLogSink();
        var previous = Log.Logger;
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .Enrich.FromLogContext()
            .WriteTo.Sink(sink)
            .CreateLogger();
        try
        {
            await using var factory = new WebApplicationFactory<Program>();
            var client = factory.CreateClient();
            var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken("admin");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var correlationId = "corr-" + Guid.NewGuid().ToString("N")[..12];
            await client.SendAsync(new HttpRequestMessage(HttpMethod.Get, "/api/v1/health")
            {
                Headers = { { "X-Correlation-Id", correlationId } },
            });

            var matched = sink.Events
                .Where(e => e.Properties.TryGetValue("CorrelationId", out var v)
                            && v is ScalarValue sv
                            && sv.Value?.ToString() == correlationId)
                .ToList();

            Assert.NotEmpty(matched);
            Assert.All(matched, e =>
            {
                Assert.True(e.Properties.TryGetValue("CorrelationId", out var v));
                Assert.Equal(correlationId, ((ScalarValue)v!).Value?.ToString());
            });
        }
        finally
        {
            Log.Logger = previous;
        }
    }
}
