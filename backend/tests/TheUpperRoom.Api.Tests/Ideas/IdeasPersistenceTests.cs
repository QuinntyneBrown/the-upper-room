// Traces to: TASK-0225
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Kanban;
using TheUpperRoom.Api.Locations;
using TheUpperRoom.Api.Notes;
using TheUpperRoom.Api.Notifications;
using TheUpperRoom.Infrastructure.Contacts;
using TheUpperRoom.Infrastructure.Ideas;
using TheUpperRoom.Infrastructure.Kanban;

namespace TheUpperRoom.Api.Tests.Ideas;

public sealed class IdeasPersistenceTests : IDisposable
{
    private readonly Dictionary<Type, string> _paths = new();

    public IdeasPersistenceTests()
    {
        foreach (var t in new[]
        {
            typeof(IdeasDbContext), typeof(EventsDbContext), typeof(ContactsDbContext),
            typeof(NotesDbContext), typeof(KanbanDbContext), typeof(LocationsDbContext),
            typeof(NotificationsDbContext), typeof(PushDbContext),
        })
        {
            _paths[t] = Path.Combine(Path.GetTempPath(), $"tar-{t.Name}-{Guid.NewGuid():N}.db");
        }
    }

    public void Dispose()
    {
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        foreach (var p in _paths.Values)
        {
            try { if (File.Exists(p)) File.Delete(p); }
            catch { /* OS will reclaim */ }
        }
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureTestServices(services =>
            {
                Replace<IdeasDbContext>(services, _paths[typeof(IdeasDbContext)]);
                Replace<EventsDbContext>(services, _paths[typeof(EventsDbContext)]);
                Replace<ContactsDbContext>(services, _paths[typeof(ContactsDbContext)]);
                Replace<NotesDbContext>(services, _paths[typeof(NotesDbContext)]);
                Replace<KanbanDbContext>(services, _paths[typeof(KanbanDbContext)]);
                Replace<LocationsDbContext>(services, _paths[typeof(LocationsDbContext)]);
                Replace<NotificationsDbContext>(services, _paths[typeof(NotificationsDbContext)]);
                Replace<PushDbContext>(services, _paths[typeof(PushDbContext)]);
            }));

    private static void Replace<TContext>(IServiceCollection services, string path) where TContext : DbContext
    {
        var d = services.Single(s => s.ServiceType == typeof(DbContextOptions<TContext>));
        services.Remove(d);
        services.AddDbContext<TContext>(o => o.UseSqlite($"Data Source={path}"));
    }

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

    private sealed record CreatedIdea(string Id, string Title, string Status, string ProposedBy);

    [Fact]
    public async Task Post_ideas_creates_draft_and_persists_across_restart()
    {
        string id;

        await using (var factory = Factory())
        {
            var client = AuthedClient(factory, "member");
            var resp = await client.PostAsJsonAsync("/api/v1/ideas",
                new { title = "Build a community garden", description = "Outdoor space for prayer." });
            Assert.Equal(HttpStatusCode.Created, resp.StatusCode);
            var created = await resp.Content.ReadFromJsonAsync<CreatedIdea>();
            Assert.NotNull(created);
            Assert.Equal("Build a community garden", created!.Title);
            Assert.Equal("Draft", created.Status);
            Assert.Equal("member", created.ProposedBy);
            id = created.Id;
        }

        await using var factory2 = Factory();
        var resp2 = await AuthedClient(factory2, "member").GetAsync($"/api/v1/ideas/{id}");
        Assert.Equal(HttpStatusCode.OK, resp2.StatusCode);
        var json = await resp2.Content.ReadAsStringAsync();
        Assert.Contains("\"title\":\"Build a community garden\"", json);
        Assert.Contains("\"status\":\"Draft\"", json);
    }

    [Fact]
    public async Task Post_ideas_with_blank_title_returns_422()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "member");

        var resp = await client.PostAsJsonAsync("/api/v1/ideas", new { title = "  ", description = "" });
        Assert.Equal(HttpStatusCode.UnprocessableEntity, resp.StatusCode);
    }

    private sealed record CommentResponse(string Id, string IdeaId, string Body, string Author, DateTimeOffset CreatedAt);
    private sealed record CommentsListResponse(CommentResponse[] Items);

    [Fact]
    public async Task Post_idea_comment_creates_and_lists_persists_across_restart()
    {
        string ideaId;

        await using (var factory = Factory())
        {
            var client = AuthedClient(factory, "member");
            var ideaResp = await client.PostAsJsonAsync("/api/v1/ideas", new { title = "Idea with comments" });
            ideaId = (await ideaResp.Content.ReadFromJsonAsync<CreatedIdea>())!.Id;

            var commentResp = await client.PostAsJsonAsync(
                $"/api/v1/ideas/{ideaId}/comments",
                new { body = "First comment from member" });
            Assert.Equal(HttpStatusCode.Created, commentResp.StatusCode);

            var leadClient = AuthedClient(factory, "lead");
            var commentResp2 = await leadClient.PostAsJsonAsync(
                $"/api/v1/ideas/{ideaId}/comments",
                new { body = "Lead chiming in" });
            Assert.Equal(HttpStatusCode.Created, commentResp2.StatusCode);
        }

        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "member");
        var listResp = await client2.GetAsync($"/api/v1/ideas/{ideaId}/comments");
        Assert.Equal(HttpStatusCode.OK, listResp.StatusCode);
        var list = await listResp.Content.ReadFromJsonAsync<CommentsListResponse>();
        Assert.NotNull(list);
        Assert.Equal(2, list!.Items.Length);
        Assert.Contains(list.Items, c => c.Body == "First comment from member" && c.Author == "member");
        Assert.Contains(list.Items, c => c.Body == "Lead chiming in" && c.Author == "lead");
    }

    [Fact]
    public async Task Post_comment_with_blank_body_returns_422()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "member");
        var ideaResp = await client.PostAsJsonAsync("/api/v1/ideas", new { title = "Blank body parent" });
        var ideaId = (await ideaResp.Content.ReadFromJsonAsync<CreatedIdea>())!.Id;

        var resp = await client.PostAsJsonAsync($"/api/v1/ideas/{ideaId}/comments", new { body = "   " });
        Assert.Equal(HttpStatusCode.UnprocessableEntity, resp.StatusCode);
    }

    [Fact]
    public async Task Post_comment_for_unknown_idea_returns_404()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "member");
        var resp = await client.PostAsJsonAsync("/api/v1/ideas/no-such-idea/comments", new { body = "hello" });
        Assert.Equal(HttpStatusCode.NotFound, resp.StatusCode);
    }
}
