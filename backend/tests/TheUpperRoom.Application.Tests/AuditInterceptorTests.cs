// traces_to: L2-098
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
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

        var (verifier, challenge) = NewPkcePair();
        var authorize = await client.PostAsJsonAsync(
            "/__idp/authorize",
            new { email = "admin@test.local", password = "UpperRoomDev!42", codeChallenge = challenge });
        authorize.EnsureSuccessStatusCode();
        var authorized = await authorize.Content.ReadFromJsonAsync<AuthorizeBody>();

        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/exchange",
            new { code = authorized!.code, codeVerifier = verifier });
        Assert.Equal(HttpStatusCode.OK, loginResp.StatusCode);

        var auditResp = await client.SendAsync(GetReq("/api/v1/admin/audit?action=Login", "admin"));
        Assert.Equal(HttpStatusCode.OK, auditResp.StatusCode);

        var audit = await auditResp.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(audit);
        Assert.Contains(audit.Items, e => e.Action == "Login");

        var successResp = await client.SendAsync(GetReq("/api/v1/admin/audit?entityType=Session&action=Success", "admin"));
        Assert.Equal(HttpStatusCode.OK, successResp.StatusCode);

        var successAudit = await successResp.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(successAudit);
        Assert.Contains(successAudit.Items, e =>
            e.EntityId == "exchange" &&
            e.Action == "Success" &&
            e.AfterJson?.Contains("ip", StringComparison.OrdinalIgnoreCase) == true);
    }

    private static (string verifier, string challenge) NewPkcePair()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        var verifier = Convert.ToBase64String(bytes)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        var hash = SHA256.HashData(Encoding.ASCII.GetBytes(verifier));
        var challenge = Convert.ToBase64String(hash)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
        return (verifier, challenge);
    }

    private sealed record AuthorizeBody(string code);

    [Fact]
    public async Task Failed_exchange_records_audit_entry()
    {
        var client = _factory.CreateClient();

        var loginResp = await client.PostAsJsonAsync("/api/v1/auth/exchange",
            new { code = "auth-code", codeVerifier = "wrong", expectedChallenge = "challenge" });
        Assert.Equal(HttpStatusCode.BadRequest, loginResp.StatusCode);

        var auditResp = await client.SendAsync(GetReq("/api/v1/admin/audit?actor=anonymous&entityType=Session&action=Failure", "admin"));
        Assert.Equal(HttpStatusCode.OK, auditResp.StatusCode);

        var audit = await auditResp.Content.ReadFromJsonAsync<AuditEnvelope>();
        Assert.NotNull(audit);
        Assert.Contains(audit.Items, e =>
            e.EntityId == "exchange" &&
            e.AfterJson?.Contains("ip", StringComparison.OrdinalIgnoreCase) == true);
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

    private HttpRequestMessage Patch(string path, object body, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Patch, path) { Content = JsonContent.Create(body) };
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken(userId));
        return req;
    }

    private HttpRequestMessage GetReq(string path, string userId = "lead")
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken(userId));
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
