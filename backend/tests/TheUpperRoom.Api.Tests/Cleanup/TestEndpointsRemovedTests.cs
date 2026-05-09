// Traces to: TASK-0231
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Tests.Cleanup;

public sealed class TestEndpointsRemovedTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public TestEndpointsRemovedTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private HttpClient AuthedClient(string userId)
    {
        var client = _factory.CreateClient();
        var token = _factory.Services.GetRequiredService<ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Get_api_v1_test_logs_returns_404()
    {
        var resp = await AuthedClient("admin").GetAsync("/api/v1/test/logs");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task Get_test_sent_mail_returns_404()
    {
        var resp = await AuthedClient("admin").GetAsync("/api/v1/notifications/test/sent-mail?toUserId=admin");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public async Task Get_test_pending_returns_404()
    {
        var resp = await AuthedClient("admin").GetAsync("/api/v1/push/test/pending?userId=lead");
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }

    [Fact]
    public void Source_under_backend_src_contains_no_test_endpoint_attributes()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p =>
            {
                var content = File.ReadAllText(p);
                return content.Contains("test/sent-mail")
                    || content.Contains("test/pending")
                    || content.Contains("Route(\"api/v1/test\"");
            })
            .ToList();
        Assert.Empty(matches);
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
