// Traces to: TASK-0228
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TheUpperRoom.Api.Tests.Kanban;

public sealed class KanbanPersistenceTests : IDisposable
{
    private readonly string _kanbanDbPath;
    private readonly string _contactsDbPath;
    private readonly string _eventsDbPath;
    private readonly string _ideasDbPath;
    private readonly string _locationsDbPath;
    private readonly string _notesDbPath;
    private readonly string _notificationsDbPath;

    public KanbanPersistenceTests()
    {
        _kanbanDbPath = Path.Combine(Path.GetTempPath(), $"tar-kanban-{Guid.NewGuid():N}.db");
        _contactsDbPath = Path.Combine(Path.GetTempPath(), $"tar-contacts-{Guid.NewGuid():N}.db");
        _eventsDbPath = Path.Combine(Path.GetTempPath(), $"tar-events-{Guid.NewGuid():N}.db");
        _ideasDbPath = Path.Combine(Path.GetTempPath(), $"tar-ideas-{Guid.NewGuid():N}.db");
        _locationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-locations-{Guid.NewGuid():N}.db");
        _notesDbPath = Path.Combine(Path.GetTempPath(), $"tar-notes-{Guid.NewGuid():N}.db");
        _notificationsDbPath = Path.Combine(Path.GetTempPath(), $"tar-notifications-{Guid.NewGuid():N}.db");
    }

    public void Dispose()
    {
        foreach (var p in new[] { _kanbanDbPath, _contactsDbPath, _eventsDbPath, _ideasDbPath, _locationsDbPath, _notesDbPath, _notificationsDbPath })
            if (File.Exists(p)) File.Delete(p);
    }

    private WebApplicationFactory<Program> Factory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(b =>
            b.ConfigureAppConfiguration((_, cfg) =>
                cfg.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["KanbanDb:ConnectionString"] = $"Data Source={_kanbanDbPath}",
                    ["ContactsDb:ConnectionString"] = $"Data Source={_contactsDbPath}",
                    ["EventsDb:ConnectionString"] = $"Data Source={_eventsDbPath}",
                    ["IdeasDb:ConnectionString"] = $"Data Source={_ideasDbPath}",
                    ["LocationsDb:ConnectionString"] = $"Data Source={_locationsDbPath}",
                    ["NotesDb:ConnectionString"] = $"Data Source={_notesDbPath}",
                    ["NotificationsDb:ConnectionString"] = $"Data Source={_notificationsDbPath}",
                })));

    private HttpClient AuthedClient(WebApplicationFactory<Program> factory, string userId)
    {
        var client = factory.CreateClient();
        var token = factory.Services.GetRequiredService<TheUpperRoom.Api.Auth.ITokenService>().IssueAccessToken(userId);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    private sealed record BoardLite(string Id, string Name);
    private sealed record BoardDetailResponse(string Id, string Name, ColumnLite[] Columns, CardLite[] Cards);
    private sealed record ColumnLite(string Id, string Name, string Color, int? WipLimit);
    private sealed record CardLite(string Id, string ColumnId, string Title);
    private sealed record ListResponse(BoardLite[] Items, int Total);
    private sealed record MoveResponse(string Id, string ColumnId);

    [Fact]
    public async Task Boards_columns_and_cards_survive_restart()
    {
        string boardId;
        string columnId;
        string cardId;

        await using (var factory = Factory())
        {
            var client = AuthedClient(factory, "lead");

            // Create board with default columns
            var boardResp = await client.PostAsJsonAsync("/api/v1/boards", new { name = "Test Board", defaultColumns = true });
            Assert.Equal(HttpStatusCode.Created, boardResp.StatusCode);
            var board = await boardResp.Content.ReadFromJsonAsync<BoardLite>();
            boardId = board!.Id;

            // Get board detail to find first column
            var detail = await client.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
            columnId = detail!.Columns[0].Id;

            // Create a card
            var cardResp = await client.PostAsJsonAsync($"/api/v1/boards/{boardId}/cards", new { title = "First Card", columnId });
            Assert.Equal(HttpStatusCode.Created, cardResp.StatusCode);
            var card = await cardResp.Content.ReadFromJsonAsync<CardLite>();
            cardId = card!.Id;
        }

        // New factory (simulating restart) — same DB file
        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "lead");

        var detail2 = await client2.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
        Assert.NotNull(detail2);
        Assert.Equal("Test Board", detail2.Name);
        Assert.True(detail2.Columns.Length >= 3);
        Assert.Contains(detail2.Cards, c => c.Id == cardId && c.ColumnId == columnId);
    }

    [Fact]
    public async Task Card_move_persists_across_restart()
    {
        string boardId;
        string cardId;
        string targetColumnId;

        await using (var factory = Factory())
        {
            var client = AuthedClient(factory, "lead");

            var boardResp = await client.PostAsJsonAsync("/api/v1/boards", new { name = "Move Board", defaultColumns = true });
            boardId = (await boardResp.Content.ReadFromJsonAsync<BoardLite>())!.Id;

            var detail = await client.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
            var sourceColumnId = detail!.Columns[0].Id;
            targetColumnId = detail.Columns[1].Id;

            var cardResp = await client.PostAsJsonAsync($"/api/v1/boards/{boardId}/cards", new { title = "Move Me", columnId = sourceColumnId });
            cardId = (await cardResp.Content.ReadFromJsonAsync<CardLite>())!.Id;

            // Move card to second column
            var move = await client.PostAsJsonAsync($"/api/v1/cards/{cardId}/move", new { targetColumnId, sourceColumnId });
            Assert.Equal(HttpStatusCode.OK, move.StatusCode);
        }

        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "lead");

        var detail2 = await client2.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
        Assert.Contains(detail2!.Cards, c => c.Id == cardId && c.ColumnId == targetColumnId);
    }

    [Fact]
    public async Task Delete_card_returns_204_and_removes_from_board()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "lead");

        var boardResp = await client.PostAsJsonAsync("/api/v1/boards", new { name = "Delete Board", defaultColumns = true });
        Assert.Equal(HttpStatusCode.Created, boardResp.StatusCode);
        var boardId = (await boardResp.Content.ReadFromJsonAsync<BoardLite>())!.Id;

        var detail = await client.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
        var columnId = detail!.Columns[0].Id;

        var cardResp = await client.PostAsJsonAsync($"/api/v1/boards/{boardId}/cards", new { title = "Doomed Card", columnId });
        Assert.Equal(HttpStatusCode.Created, cardResp.StatusCode);
        var cardId = (await cardResp.Content.ReadFromJsonAsync<CardLite>())!.Id;

        var del = await client.DeleteAsync($"/api/v1/cards/{cardId}");
        Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);

        var afterDetail = await client.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
        Assert.DoesNotContain(afterDetail!.Cards, c => c.Id == cardId);
    }

    [Fact]
    public async Task Delete_unknown_card_returns_404()
    {
        await using var factory = Factory();
        var client = AuthedClient(factory, "lead");

        var del = await client.DeleteAsync("/api/v1/cards/does-not-exist");
        Assert.Equal(HttpStatusCode.NotFound, del.StatusCode);
    }

    [Fact]
    public async Task Delete_card_persists_across_restart()
    {
        string boardId;
        string cardId;

        await using (var factory = Factory())
        {
            var client = AuthedClient(factory, "lead");

            var boardResp = await client.PostAsJsonAsync("/api/v1/boards", new { name = "Restart Delete Board", defaultColumns = true });
            boardId = (await boardResp.Content.ReadFromJsonAsync<BoardLite>())!.Id;

            var detail = await client.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
            var columnId = detail!.Columns[0].Id;

            var cardResp = await client.PostAsJsonAsync($"/api/v1/boards/{boardId}/cards", new { title = "Will Be Deleted", columnId });
            cardId = (await cardResp.Content.ReadFromJsonAsync<CardLite>())!.Id;

            var del = await client.DeleteAsync($"/api/v1/cards/{cardId}");
            Assert.Equal(HttpStatusCode.NoContent, del.StatusCode);
        }

        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "lead");

        var detail2 = await client2.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
        Assert.DoesNotContain(detail2!.Cards, c => c.Id == cardId);
    }

    [Fact]
    public async Task Wip_limit_survives_restart()
    {
        string boardId;
        string columnId;

        await using (var factory = Factory())
        {
            var client = AuthedClient(factory, "lead");

            var boardResp = await client.PostAsJsonAsync("/api/v1/boards", new { name = "WIP Board", defaultColumns = true });
            boardId = (await boardResp.Content.ReadFromJsonAsync<BoardLite>())!.Id;

            var detail = await client.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
            columnId = detail!.Columns[0].Id;

            // Set WIP limit on first column
            var patch = await client.PatchAsJsonAsync($"/api/v1/boards/{boardId}/columns/{columnId}", new { wipLimit = 3 });
            Assert.Equal(HttpStatusCode.OK, patch.StatusCode);
        }

        await using var factory2 = Factory();
        var client2 = AuthedClient(factory2, "lead");

        var detail2 = await client2.GetFromJsonAsync<BoardDetailResponse>($"/api/v1/boards/{boardId}");
        var col = detail2!.Columns.First(c => c.Id == columnId);
        Assert.Equal(3, col.WipLimit);
    }
}
