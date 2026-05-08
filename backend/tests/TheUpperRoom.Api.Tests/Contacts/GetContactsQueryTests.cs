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
        req.Headers.Add("X-Test-User-Id", userId);
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
    public async Task Empty_city_returns_empty_items_array()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts", "guest"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PagedEnvelope>();
        Assert.NotNull(body);
        Assert.Empty(body.Items);
    }

    private sealed record PagedEnvelope(ContactDto[] Items, int Total);
    private sealed record ContactDto(string Id, string Name, string CityId);
}
