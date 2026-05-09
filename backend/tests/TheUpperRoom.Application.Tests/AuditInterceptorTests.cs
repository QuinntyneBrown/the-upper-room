// traces_to: L2-098
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class AuditInterceptorTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuditInterceptorTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Patch_contact_records_before_and_after_json()
    {
        var client = _factory.CreateClient();

        var resp = await client.SendAsync(Patch("/api/v1/contacts/c1", new { name = "Alice Jones" }));
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);

        var auditResp = await client.SendAsync(GetReq("/api/v1/admin/audit?actor=lead&entityType=Contact&action=Update", "admin"));
        Assert.Equal(HttpStatusCode.OK, auditResp.StatusCode);

        var audit = await auditResp.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(audit);
        Assert.Contains(audit.Items, e =>
            e.EntityId == "c1" &&
            e.BeforeJson != null &&
            e.AfterJson != null &&
            e.AfterJson.Contains("Alice Jones"));
    }

    [Fact]
    public async Task Successful_login_records_audit_entry()
    {
        var client = _factory.CreateClient();

        const string verifier = "abc123";
        const string challenge = "bKE9UspwyIPg8LsQHkJaiehiTeUdstI5JZOvaoQRgJA";
        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/exchange",
            new { code = "auth-code", codeVerifier = verifier, expectedChallenge = challenge });
        Assert.Equal(HttpStatusCode.OK, loginResp.StatusCode);

        var auditResp = await client.SendAsync(GetReq("/api/v1/admin/audit?action=Login", "admin"));
        Assert.Equal(HttpStatusCode.OK, auditResp.StatusCode);

        var audit = await auditResp.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(audit);
        Assert.Contains(audit.Items, e => e.Action == "Login");
    }

    [Fact]
    public async Task Permission_denied_access_records_audit_entry()
    {
        var client = _factory.CreateClient();

        var forbiddenResp = await client.SendAsync(GetReq("/api/v1/admin/audit", "lead"));
        Assert.Equal(HttpStatusCode.Forbidden, forbiddenResp.StatusCode);

        var auditResp = await client.SendAsync(GetReq("/api/v1/admin/audit?actor=lead&action=PermissionDenied", "admin"));
        Assert.Equal(HttpStatusCode.OK, auditResp.StatusCode);

        var audit = await auditResp.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(audit);
        Assert.Contains(audit.Items, e => e.ActorUserId == "lead" && e.Action == "PermissionDenied");
    }

    private static HttpRequestMessage Patch(string path, object body, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Patch, path) { Content = JsonContent.Create(body) };
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
    }

    private static HttpRequestMessage GetReq(string path, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Add("X-Test-User-Id", userId);
        return req;
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
