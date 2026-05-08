// traces_to: L2-015
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace TheUpperRoom.Api.Auth;

public sealed record ExchangeRequest(string Code, string CodeVerifier, string ExpectedChallenge);

public sealed record ExchangeResponse(string AccessToken);

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/v1/auth/exchange", (ExchangeRequest req, IPkceVerifier verifier, HttpContext ctx) =>
        {
            if (!verifier.Verify(req.CodeVerifier, req.ExpectedChallenge))
            {
                return Results.BadRequest(new { code = "auth.invalid_credentials" });
            }

            ctx.Response.Cookies.Append("tar.refresh", "fake-refresh-token", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Path = "/api/v1/auth"
            });

            return Results.Ok(new ExchangeResponse("fake-access-token"));
        });

        return app;
    }
}
