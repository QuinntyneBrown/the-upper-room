// traces_to: L2-023
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace TheUpperRoom.Api.Rbac;

public sealed record MeResponse(string Id, string Email, string City, string[] Roles, string[] Permissions);

public static class UsersEndpoints
{
    public static IEndpointRouteBuilder MapUsersEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/users/me", (HttpContext ctx) =>
        {
            var userId = ctx.Request.Headers["X-Test-User-Id"].ToString();
            if (string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user))
            {
                return Results.Unauthorized();
            }
            return Results.Ok(new MeResponse(
                user.Id,
                user.Email,
                user.City,
                new[] { user.Role },
                Permissions.For(user.Role).ToArray()));
        });
        return app;
    }
}
