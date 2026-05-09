// traces_to: L2-097, TASK-0232
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Logging;

namespace TheUpperRoom.Application.Tests;

public sealed class LoggingScrubberTests
{
    private static readonly string[] SensitiveWords =
        ["password", "secret", "code_verifier", "Authorization", "Cookie", "test-token-do-not-log"];

    private static readonly string[] SensitiveTemplateWords =
        ["password", "code_verifier", "token"];

    private static readonly Regex LoggerTemplatePattern = new(
        @"\.Log(?:Trace|Debug|Information|Warning|Error|Critical)\s*\(\s*(?:[A-Za-z_][A-Za-z0-9_]*\s*,\s*)?(?:\$|@)?""(?<template>(?:\\.|[^""\\])*)""",
        RegexOptions.Compiled | RegexOptions.Singleline);

    [Fact]
    public async Task Log_entries_do_not_contain_sensitive_field_names_or_values()
    {
        var sink = new TestLogSink();
        await using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder => builder.ConfigureLogging(logging =>
            {
                logging.ClearProviders();
                logging.AddProvider(sink);
            }));
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

        foreach (var entry in sink.Entries)
        {
            foreach (var word in SensitiveWords)
            {
                Assert.DoesNotContain(word, entry.Message, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain(word, string.Join(' ', entry.Properties.Values), StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain(word, string.Join(' ', entry.Scopes.SelectMany(scope => scope.Values)), StringComparison.OrdinalIgnoreCase);
            }
        }
    }

    [Fact]
    public void Logger_message_templates_do_not_name_sensitive_values()
    {
        var root = FindRepoRoot();
        var sourceRoot = Path.Combine(root, "backend", "src");
        var violations = Directory.GetFiles(sourceRoot, "*.cs", SearchOption.AllDirectories)
            .Where(file => !file.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase)
                && !file.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            .SelectMany(file => LoggerTemplatePattern.Matches(File.ReadAllText(file))
                .Select(match => new
                {
                    File = Path.GetRelativePath(root, file),
                    Template = match.Groups["template"].Value,
                }))
            .Where(match => SensitiveTemplateWords.Any(word =>
                match.Template.Contains(word, StringComparison.OrdinalIgnoreCase)))
            .Select(match => $"{match.File}: {match.Template}")
            .ToArray();

        Assert.Empty(violations);
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir != null && !Directory.Exists(Path.Combine(dir.FullName, ".git")))
        {
            dir = dir.Parent;
        }

        return dir?.FullName ?? AppContext.BaseDirectory;
    }
}
