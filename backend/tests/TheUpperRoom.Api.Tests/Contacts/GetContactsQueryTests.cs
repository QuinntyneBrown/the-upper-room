// traces_to: L2-029, L2-030
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Contacts;

public sealed class GetContactsQueryTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public GetContactsQueryTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private HttpRequestMessage Get(string path, string userId)
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken(userId));
        return req;
    }

    [Fact]
    public async Task CityLead_gets_paged_envelope_with_only_own_city_contacts()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts", "lead"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PagedEnvelope>();
        Assert.NotNull(body);
        Assert.All(body.Items, c => Assert.Equal("Toronto", c.CityId));
    }

    [Fact]
    public async Task Unauthenticated_request_returns_401()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/v1/contacts");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Halifax_lead_sees_only_Halifax_contacts()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts", "member"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PagedEnvelope>();
        Assert.NotNull(body);
        Assert.All(body.Items, c => Assert.Equal("Toronto", c.CityId));
    }

}
