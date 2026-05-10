// traces_to: PHASE-2.6
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Api.Tests.Contacts;

public sealed class ContactsValidationProblemDetailsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ContactsValidationProblemDetailsTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Create_contact_with_empty_first_name_returns_400_validation_problem_details()
    {
        var client = _factory.CreateClient();
        var token = _factory.Services.GetRequiredService<ITokenService>().IssueAccessToken("lead");

        var req = new HttpRequestMessage(HttpMethod.Post, "/api/v1/contacts")
        {
            Content = JsonContent.Create(new { firstName = "", lastName = "Smith" }),
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.SendAsync(req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDocument>();
        Assert.NotNull(problem);
        Assert.NotNull(problem.Errors);
        Assert.Contains(problem.Errors, kv =>
            kv.Key.Contains("FirstName", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Update_contact_with_empty_first_name_returns_400_validation_problem_details()
    {
        var client = _factory.CreateClient();
        var token = _factory.Services.GetRequiredService<ITokenService>().IssueAccessToken("lead");

        var req = new HttpRequestMessage(HttpMethod.Put, "/api/v1/contacts/c1")
        {
            Content = JsonContent.Create(new { firstName = "", lastName = "Smith" }),
        };
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

        var response = await client.SendAsync(req);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    private sealed record ValidationProblemDocument(
        int? Status,
        string? Title,
        Dictionary<string, string[]>? Errors);
}
