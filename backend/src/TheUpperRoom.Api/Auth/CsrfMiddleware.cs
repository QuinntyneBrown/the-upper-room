// traces_to: L2-096
namespace TheUpperRoom.Api.Auth;

public sealed class CsrfMiddleware
{
    private readonly RequestDelegate _next;

    public CsrfMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Method == HttpMethods.Get && !context.Request.Cookies.ContainsKey("XSRF-TOKEN"))
        {
            var token = Guid.NewGuid().ToString("N");
            context.Response.Cookies.Append("XSRF-TOKEN", token, new CookieOptions
            {
                HttpOnly = false,
                Secure = false,
                SameSite = SameSiteMode.Strict,
                Path = "/",
            });
        }

        await _next(context);
    }
}
