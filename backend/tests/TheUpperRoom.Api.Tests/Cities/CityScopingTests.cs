// traces_to: L2-079
using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Api.Tests.Cities;

public sealed class CityScopingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public CityScopingTests(WebApplicationFactory<Program> factory) => _factory = factory;

    private HttpRequestMessage Get(string path, string userId, bool allCities = false)
    {
        var req = new HttpRequestMessage(HttpMethod.Get, path);
        req.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _factory.IssueAccessToken(userId));
        if (allCities) req.Headers.Add("X-All-Cities", "true");
        return req;
    }

    [Fact]
    public async Task CityLead_in_Toronto_can_read_Toronto_contact()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts/c1", "lead"));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CityLead_in_Toronto_gets_404_for_Halifax_contact_no_existence_leak()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts/c2", "lead"));
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task SystemAdmin_with_all_cities_header_bypasses_filter()
    {
        var client = _factory.CreateClient();
        var response = await client.SendAsync(Get("/api/v1/contacts/c2", "admin", allCities: true));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
