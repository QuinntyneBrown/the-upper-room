// Traces to: TASK-0225
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Ideas;

namespace TheUpperRoom.Api.Tests.Ideas;

public sealed class IdeasPersistenceTests : IDisposable
{
    private readonly string _ideasDbPath;
    private readonly string _eventsDbPath;
    private readonly string _contactsDbPath;

    public IdeasPersistenceTests()
    {
        _ideasDbPath = Path.Combine(Path.GetTempPath(), $"tar-ideas-{Guid.NewGuid():N}.db");
        _eventsDbPath = Path.Combine(Path.GetTempPath(), $"tar-events-{Guid.NewGuid():N}.db");
        _contactsDbPath = Path.Combine(Path.GetTempPath(), $"tar-contacts-{Guid.NewGuid():N}.db");
    }

    public void Dispose()
    {
        foreach (var p in new[] { _ideasDbPath, _eventsDbPath, _contactsDbPath })
            if (File.Exists(p)) File.Delete(p);
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["IdeasDb:ConnectionString"] = $"Data Source={_ideasDbPath}",
                    ["EventsDb:ConnectionString"] = $"Data Source={_eventsDbPath}",
                    ["ContactsDb:ConnectionString"] = $"Data Source={_contactsDbPath}",
                })));

    private static HttpClient AuthedClient(WebApplicationFactory<Program> factory, string userId)
    {
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private static string SeedIdea(WebApplicationFactory<Program> factory, string id, string proposedBy, string status = "Submitted")
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IdeasDbContext>();
        db.Ideas.Add(new IdeaRow
        {
            Id = id,
            Title = $"Idea {id}",
            Description = "",
            BodyMarkdown = "",
            BodyHtmlSanitized = "",
            Status = status,
            ProposedBy = proposedBy,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow,
            Tags = Array.Empty<string>(),
        });
        db.SaveChanges();
        return id;
    }

    [Fact]
    public async Task Idea_persists_across_host_restart()
    {
        const string id = "idea-1";
        await using (var factory1 = Factory())
        {
            SeedIdea(factory1, id, "lead");
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/ideas/{id}");
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
    }

    [Fact]
    public async Task Vote_count_persists_across_host_restart()
    {
        const string id = "idea-2";
        await using (var factory1 = Factory())
        {
            SeedIdea(factory1, id, "lead");
            var voteResp = await AuthedClient(factory1, "lead").PostAsync($"/api/v1/ideas/{id}/vote", null);
            Assert.Equal(HttpStatusCode.OK, voteResp.StatusCode);
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/ideas/{id}");
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("\"voteCount\":1", json);
    }

    [Fact]
    public async Task Idea_partner_links_persist_across_host_restart()
    {
        const string id = "idea-3";
        await using (var factory1 = Factory())
        {
            SeedIdea(factory1, id, "lead");
            var linkResp = await AuthedClient(factory1, "lead").PostAsJsonAsync(
                $"/api/v1/ideas/{id}/partners",
                new { partnerId = "p1", partnerName = "Partner One" });
            Assert.Equal(HttpStatusCode.Created, linkResp.StatusCode);
        }

        await using var factory2 = Factory();
        var resp = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/ideas/{id}/partners");
        var json = await resp.Content.ReadAsStringAsync();
        Assert.Contains("\"id\":\"p1\"", json);
    }

    [Fact]
    public async Task Status_transitions_persist_across_host_restart()
    {
        const string id = "idea-4";
        await using (var factory1 = Factory())
        {
            SeedIdea(factory1, id, "lead", status: "Submitted");
            var resp = await AuthedClient(factory1, "lead").PostAsJsonAsync(
                $"/api/v1/ideas/{id}/status",
                new { status = "Selected" });
            Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        }

        await using var factory2 = Factory();
        var resp2 = await AuthedClient(factory2, "lead").GetAsync($"/api/v1/ideas/{id}");
        var json = await resp2.Content.ReadAsStringAsync();
        Assert.Contains("\"status\":\"Selected\"", json);
    }
}
