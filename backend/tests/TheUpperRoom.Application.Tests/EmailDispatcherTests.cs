// traces_to: L2-063
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TheUpperRoom.Domain.Notifications;

namespace TheUpperRoom.Application.Tests;

public sealed class EmailDispatcherTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public EmailDispatcherTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public void All_14_codes_have_email_templates()
    {
        Assert.Equal(14, NotificationCatalog.All.Count);
        Assert.All(NotificationCatalog.All, t => Assert.NotEmpty(t.Title));
    }

    [Fact]
    public async Task Dispatch_sends_email_with_rendered_subject_and_body()
    {
        var client = _factory.CreateClient();

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/api/v1/notifications/dispatch")
        {
            Headers = { Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("lead")) },
            Content = JsonContent.Create(new
            {
                code = "invite_sent",
                recipientIds = new[] { "admin" },
                data = new { email = "test@example.com", city = "Ottawa" },
            }),
        });

        var mail = await GetSentMail(client, "admin");
        Assert.Contains(mail, m => m.Subject.Contains("Invitation sent") && m.Body.Contains("test@example.com"));
    }

    [Fact]
    public async Task Email_disabled_for_code_skips_send()
    {
        var client = _factory.CreateClient();

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Put, "/api/v1/notifications/preferences")
        {
            Headers = { Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("guest")) },
            Content = JsonContent.Create(new { code = "welcome", inApp = true, email = false, push = false }),
        });

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/api/v1/notifications/dispatch")
        {
            Headers = { Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("lead")) },
            Content = JsonContent.Create(new { code = "welcome", recipientIds = new[] { "guest" } }),
        });

        var mail = await GetSentMail(client, "guest");
        Assert.DoesNotContain(mail, m => m.Subject.Contains("Welcome to The Upper Room"));
    }

    private async Task<MailDto[]> GetSentMail(HttpClient client, string toUserId)
    {
        var req = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/notifications/test/sent-mail?toUserId={toUserId}")
        {
            Headers = { Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("admin")) },
        };
        var resp = await client.SendAsync(req);
        Assert.Equal(HttpStatusCode.OK, resp.StatusCode);
        return await resp.Content.ReadFromJsonAsync<MailDto[]>() ?? [];
    }

    private sealed record MailDto(string ToUserId, string Subject, string Body, DateTimeOffset SentAt);
}
