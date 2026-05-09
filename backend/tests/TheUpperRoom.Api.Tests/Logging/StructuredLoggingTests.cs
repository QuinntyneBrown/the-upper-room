// Traces to: TASK-0232
using System.IO;
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Logging;

public sealed class StructuredLoggingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public StructuredLoggingTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public void InMemorySink_does_not_exist_in_backend_src()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p => File.ReadAllText(p).Contains("InMemorySink"))
            .ToList();
        Assert.Empty(matches);
    }

    [Fact]
    public async Task Public_api_does_not_expose_captured_log_events()
    {
        var client = _factory.CreateClient();
        var resp = await client.GetAsync("/api/v1/test/logs?correlationId=anything");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    private static string LocateSrcRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "TheUpperRoom.sln")))
            dir = dir.Parent;
        Assert.NotNull(dir);
        return Path.Combine(dir!.FullName, "src");
    }
}
