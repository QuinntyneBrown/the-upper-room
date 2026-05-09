// traces_to: L2-097, TASK-0232
using Microsoft.AspNetCore.Mvc.Testing;
using Serilog;
using Serilog.Events;
using TheUpperRoom.Api.Logging;

namespace TheUpperRoom.Application.Tests;

public sealed class LoggingScrubberTests
{
    private static readonly string[] SensitiveWords =
        ["password", "secret", "code_verifier", "Authorization", "Cookie", "test-token-do-not-log"];

    [Fact]
    public async Task Log_entries_do_not_contain_sensitive_field_names_or_values()
    {
        var sink = new TestLogSink();
        var previous = Log.Logger;
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .Enrich.With<SensitiveFieldScrubber>()
            .Enrich.FromLogContext()
            .WriteTo.Sink(sink)
            .CreateLogger();
        try
        {
            await using var factory = new WebApplicationFactory<Program>();
            var client = factory.CreateClient();
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

            foreach (var entry in sink.Events)
            {
                var rendered = entry.RenderMessage();
                foreach (var word in SensitiveWords)
                {
                    Assert.DoesNotContain(word, rendered, StringComparison.OrdinalIgnoreCase);
                    foreach (var p in entry.Properties.Values)
                    {
                        if (p is ScalarValue sv && sv.Value is string s)
                            Assert.DoesNotContain(word, s, StringComparison.OrdinalIgnoreCase);
                    }
                }
            }
        }
        finally
        {
            Log.Logger = previous;
        }
    }
}
