using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Application.Tests;

public sealed class SignInTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public SignInTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Sign_in_with_seeded_user_returns_access_token_and_refresh_cookie()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email = "admin@test.local", password = "UpperRoomDev!42" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ExchangeResponse>();
        Assert.False(string.IsNullOrWhiteSpace(body?.AccessToken));
        Assert.Contains(response.Headers.GetValues("Set-Cookie"), value => value.StartsWith("tar.refresh=", StringComparison.Ordinal));

        var audit = await GetAuditAsync(client, "actor=admin&entityType=Session&action=Success");
        Assert.Contains(audit.Items, entry =>
            entry.EntityId == "sign-in" &&
            entry.AfterJson?.Contains("ip", StringComparison.OrdinalIgnoreCase) == true);
    }

    [Fact]
    public async Task Sign_in_with_wrong_password_returns_unauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/sign-in",
            new { email = "admin@test.local", password = "wrong" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        var actor = Uri.EscapeDataString("admin@test.local");
        var audit = await GetAuditAsync(client, $"actor={actor}&entityType=Session&action=Failure");
        Assert.Contains(audit.Items, entry =>
            entry.EntityId == "sign-in" &&
            entry.AfterJson?.Contains("ip", StringComparison.OrdinalIgnoreCase) == true);
    }

    private async Task<AuditEnvelope> GetAuditAsync(HttpClient client, string query)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/admin/audit?{query}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin"));

        var response = await client.SendAsync(request);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return (await response.Content.ReadFromJsonAsync<AuditEnvelope>())!;
    }

    private sealed record AuditEntryDto(
        string Id,
        DateTimeOffset Timestamp,
        string ActorUserId,
        string EntityType,
        string EntityId,
        string Action,
        string? BeforeJson,
        string? AfterJson);

    private sealed record AuditEnvelope(AuditEntryDto[] Items, int Total, int Page, int PageSize);
}
