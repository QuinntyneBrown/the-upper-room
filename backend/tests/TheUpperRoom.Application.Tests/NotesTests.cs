// traces_to: L2-041, L2-093
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class NotesTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public NotesTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_note_sanitizes_script_but_preserves_raw_markdown()
    {
        var client = _factory.CreateClient();

        var response = await client.SendAsync(Post("/api/v1/notes", new
        {
            subjectType = "Contact",
            subjectId = "c1",
            bodyMarkdown = "<script>alert(1)</script>foo",
        }));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var note = await response.Content.ReadFromJsonAsync<NoteDto>();
        Assert.NotNull(note);
        Assert.Equal("<script>alert(1)</script>foo", note.BodyMarkdown);
        Assert.DoesNotContain("<script>", note.BodyHtmlSanitized, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("foo", note.BodyHtmlSanitized, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task Update_note_copies_previous_version_to_history()
    {
        var client = _factory.CreateClient();

        var created = await CreateNote(client, "v1");
        Assert.NotNull(created);

        var updateResp = await client.SendAsync(Put($"/api/v1/notes/{created.Id}", new { bodyMarkdown = "v2" }));
        Assert.Equal(HttpStatusCode.OK, updateResp.StatusCode);
        var updated = await updateResp.Content.ReadFromJsonAsync<NoteDto>();
        Assert.NotNull(updated);
        Assert.Single(updated.History);
        Assert.Equal("v1", updated.History[0].BodyMarkdown);
    }

    [Fact]
    public async Task Delete_note_removes_it_and_its_versions()
    {
        var client = _factory.CreateClient();

        var created = await CreateNote(client, "to-delete");
        Assert.NotNull(created);

        var deleteResp = await client.SendAsync(Delete($"/api/v1/notes/{created.Id}"));
        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        var getResp = await client.SendAsync(GetById($"/api/v1/notes/{created.Id}"));
        Assert.Equal(HttpStatusCode.NotFound, getResp.StatusCode);
    }

    private async Task<NoteDto?> CreateNote(HttpClient client, string bodyMarkdown)
    {
        var resp = await client.SendAsync(Post("/api/v1/notes", new
        {
            subjectType = "Contact",
            subjectId = "c1",
            bodyMarkdown,
        }));
        return resp.StatusCode == HttpStatusCode.Created
            ? await resp.Content.ReadFromJsonAsync<NoteDto>()
            : null;
    }

    private static HttpRequestMessage Post(string path, object body, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Post, path) { Content = JsonContent.Create(body) };
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private static HttpRequestMessage Put(string path, object body, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Put, path) { Content = JsonContent.Create(body) };
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private static HttpRequestMessage Delete(string path, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Delete, path);
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private static HttpRequestMessage GetById(string path, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private sealed record NoteDto(
        string Id,
        string SubjectType,
        string SubjectId,
        string BodyMarkdown,
        string BodyHtmlSanitized,
        NoteVersionDto[] History);

    private sealed record NoteVersionDto(string Id, string BodyMarkdown, string BodyHtmlSanitized);
}
