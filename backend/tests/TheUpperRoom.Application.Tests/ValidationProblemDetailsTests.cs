// traces_to: PHASE-1.11
using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace TheUpperRoom.Application.Tests;

public sealed class ValidationProblemDetailsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ValidationProblemDetailsTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task Register_with_short_password_returns_400_with_validation_problem_details()
    {
        var client = _factory.CreateClient();

        // 6-char password violates RegisterCommandValidator (min 12).
        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new { email = "user@test.local", password = "short!" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var contentType = response.Content.Headers.ContentType?.MediaType;
        Assert.Equal("application/problem+json", contentType);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDocument>();
        Assert.NotNull(problem);
        Assert.Equal(400, problem.Status);
        Assert.NotNull(problem.Errors);
        Assert.Contains(problem.Errors, kv =>
            kv.Key.Contains("Password", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public async Task Register_with_invalid_email_returns_400_with_email_error_field()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new { email = "not-an-email", password = "ValidPass!42x" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var problem = await response.Content.ReadFromJsonAsync<ValidationProblemDocument>();
        Assert.NotNull(problem);
        Assert.NotNull(problem.Errors);
        Assert.Contains(problem.Errors, kv =>
            kv.Key.Contains("Email", StringComparison.OrdinalIgnoreCase));
    }

    private sealed record ValidationProblemDocument(
        int? Status,
        string? Title,
        Dictionary<string, string[]>? Errors);
}
