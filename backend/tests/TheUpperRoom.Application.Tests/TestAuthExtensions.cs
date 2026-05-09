// Traces to: TASK-0222
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Application.Tests;

internal static class TestAuthExtensions
{
    public static string IssueAccessToken(this WebApplicationFactory<Program> factory, string userId)
        => factory.Services.GetRequiredService<ITokenService>().IssueAccessToken(userId);
}
