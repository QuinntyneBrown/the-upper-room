// Traces to: TASK-0232
using System.Collections.Concurrent;
using Serilog.Core;
using Serilog.Events;

namespace TheUpperRoom.Application.Tests;

internal sealed class TestLogSink : ILogEventSink
{
    public ConcurrentBag<LogEvent> Events { get; } = new();
    public void Emit(LogEvent logEvent) => Events.Add(logEvent);
}
