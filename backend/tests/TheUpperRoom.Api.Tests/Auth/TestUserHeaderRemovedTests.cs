// Traces to: TASK-0222
using System.IO;
using System.Net;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Tests.Auth;

public sealed class TestUserHeaderRemovedTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public TestUserHeaderRemovedTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Header_alone_without_bearer_returns_401_on_authorize_endpoint()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Test-User-Id", "admin");

        var response = await client.GetAsync("/api/v1/contacts");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Bearer_token_resolves_to_same_user_seen_by_controller()
    {
        var client = _factory.CreateClient();
        var tokens = _factory.Services.GetRequiredService<ITokenService>();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokens.IssueAccessToken("admin"));

        // /api/v1/auth/me echoes the resolved sub claim — proves wiring end-to-end.
        var response = await client.GetAsync("/api/v1/auth/me");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"userId\":\"admin\"", json);
    }

    [Fact]
    public void Source_under_backend_src_contains_no_X_Test_User_Id_literal()
    {
        var srcRoot = LocateSrcRoot();
        var matches = Directory
            .EnumerateFiles(srcRoot, "*.cs", SearchOption.AllDirectories)
            .Where(p => !p.Contains($"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}")
                        && !p.Contains($"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}"))
            .Where(p => File.ReadAllText(p).Contains("X-Test-User-Id"))
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
