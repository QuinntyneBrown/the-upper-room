// traces_to: L2-063, TASK-0231
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Notifications;
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
            Headers = { Authorization = new AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("lead")) },
            Content = JsonContent.Create(new
            {
                code = "invite_sent",
                recipientIds = new[] { "admin" },
                data = new { email = "test@example.com", city = "Ottawa" },
            }),
        });

        var mail = GetSentMail("admin");
        Assert.Contains(mail, m => m.Subject.Contains("Invitation sent") && m.Body.Contains("test@example.com"));
    }

    [Fact]
    public async Task Email_disabled_for_code_skips_send()
    {
        var client = _factory.CreateClient();

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Put, "/api/v1/notifications/preferences")
        {
            Headers = { Authorization = new AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("guest")) },
            Content = JsonContent.Create(new { code = "welcome", inApp = true, email = false, push = false }),
        });

        await client.SendAsync(new HttpRequestMessage(HttpMethod.Post, "/api/v1/notifications/dispatch")
        {
            Headers = { Authorization = new AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken("lead")) },
            Content = JsonContent.Create(new { code = "welcome", recipientIds = new[] { "guest" } }),
        });

        var mail = GetSentMail("guest");
        Assert.DoesNotContain(mail, m => m.Subject.Contains("Welcome to The Upper Room"));
    }

    private SentMailRow[] GetSentMail(string toUserId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<NotificationsDbContext>();
        return db.SentMail.Where(m => m.ToUserId == toUserId).ToArray();
    }
}
