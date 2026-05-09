// traces_to: L2-097
using Serilog.Core;
using Serilog.Events;

namespace TheUpperRoom.Api.Logging;

public sealed class SensitiveFieldScrubber : ILogEventEnricher
{
    private static readonly HashSet<string> _sensitive = new(StringComparer.OrdinalIgnoreCase)
    {
        "password", "token", "secret", "code_verifier", "authorization", "cookie",
    };

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory factory)
    {
        foreach (var key in _sensitive)
            logEvent.RemovePropertyIfPresent(key);
    }
}
