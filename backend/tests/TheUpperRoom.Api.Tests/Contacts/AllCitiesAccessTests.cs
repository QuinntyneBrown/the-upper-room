// Traces to: TASK-0233
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Tests.Contacts;

public sealed class AllCitiesAccessTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AllCitiesAccessTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private HttpRequestMessage Get(string path, string userId, bool addLegacyHeader = false)
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        var token = _factory.Services.GetRequiredService<ITokenService>().IssueAccessToken(userId);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        if (addLegacyHeader) req.Headers.Add("X-All-Cities", "true");
        return req;
    }

    [Fact]
    public async Task Legacy_X_All_Cities_header_is_ignored()
    {
        // c2 is a Halifax contact; the lead user belongs to Toronto.
        // With the legacy header, the bypass would have returned 200; now it must 404.
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts/c2", "lead", addLegacyHeader: true));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Scope_all_as_non_SystemAdmin_returns_403()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts?scope=all", "lead"));
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Scope_all_as_SystemAdmin_returns_contacts_across_all_cities()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts?scope=all", "admin"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"id\":\"c1\"", json); // Toronto
        Assert.Contains("\"id\":\"c2\"", json); // Halifax
    }

    [Fact]
    public void Source_under_backend_src_contains_no_X_All_Cities_literal()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p => File.ReadAllText(p).Contains("X-All-Cities"))
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
