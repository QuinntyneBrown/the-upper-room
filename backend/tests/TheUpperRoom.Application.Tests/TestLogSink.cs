// Traces to: TASK-0232
using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace TheUpperRoom.Application.Tests;

internal sealed class TestLogSink : ILoggerProvider, ISupportExternalScope
{
    private IExternalScopeProvider _scopeProvider = new LoggerExternalScopeProvider();

    public ConcurrentBag<TestLogEntry> Entries { get; } = new();

    public ILogger CreateLogger(string categoryName) => new TestLogger(categoryName, Entries, () => _scopeProvider);

    public void SetScopeProvider(IExternalScopeProvider scopeProvider)
    {
        _scopeProvider = scopeProvider;
    }

    public void Dispose()
    {
    }

    private sealed class TestLogger : ILogger
    {
        private readonly string _categoryName;
        private readonly ConcurrentBag<TestLogEntry> _entries;
        private readonly Func<IExternalScopeProvider> _scopeProvider;

        public TestLogger(
            string categoryName,
            ConcurrentBag<TestLogEntry> entries,
            Func<IExternalScopeProvider> scopeProvider)
        {
            _categoryName = categoryName;
            _entries = entries;
            _scopeProvider = scopeProvider;
        }

        public IDisposable? BeginScope<TState>(TState state)
            where TState : notnull =>
            _scopeProvider().Push(state);

        public bool IsEnabled(LogLevel logLevel) => logLevel != LogLevel.None;

        public void Log<TState>(
            LogLevel logLevel,
            EventId eventId,
            TState state,
            Exception? exception,
            Func<TState, Exception?, string> formatter)
        {
            var scopes = new List<IReadOnlyDictionary<string, object?>>();
            _scopeProvider().ForEachScope(
                static (scope, target) => target.Add(ToProperties(scope)),
                scopes);

            _entries.Add(new TestLogEntry(
                _categoryName,
                logLevel,
                formatter(state, exception),
                ToProperties(state),
                scopes));
        }
    }

    private static IReadOnlyDictionary<string, object?> ToProperties(object? state)
    {
        if (state is IEnumerable<KeyValuePair<string, object?>> values)
        {
            return values
                .Where(pair => pair.Key != "{OriginalFormat}")
                .ToDictionary(pair => pair.Key, pair => pair.Value);
        }

        return state is null
            ? new Dictionary<string, object?>()
            : new Dictionary<string, object?> { ["State"] = state };
    }
}

internal sealed record TestLogEntry(
    string CategoryName,
    LogLevel Level,
    string Message,
    IReadOnlyDictionary<string, object?> Properties,
    IReadOnlyList<IReadOnlyDictionary<string, object?>> Scopes);
