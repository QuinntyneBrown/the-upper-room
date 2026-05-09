// traces_to: L2-096
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TheUpperRoom.Api.Auth;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public sealed class RequireXsrfAttribute : Attribute, IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var request = context.HttpContext.Request;
        var cookieToken = request.Cookies["XSRF-TOKEN"];
        var headerToken = request.Headers["X-XSRF-TOKEN"].FirstOrDefault();

        if (string.IsNullOrEmpty(cookieToken) || cookieToken != headerToken)
        {
            context.Result = new ObjectResult(new { code = "csrf.invalid" })
            {
                StatusCode = StatusCodes.Status403Forbidden,
            };
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
