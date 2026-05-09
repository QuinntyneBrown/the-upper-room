// traces_to: L2-097
using Serilog.Core;
using Serilog.Events;

namespace TheUpperRoom.Api.Logging;

public sealed class InMemorySink : ILogEventSink
{
    public static readonly List<LogEvent> Events = [];

    public void Emit(LogEvent logEvent) => Events.Add(logEvent);
}
