// traces_to: L2-080, L2-015, L2-023, L2-079, L2-097
using Serilog;
using Serilog.Context;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Logging;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.With<SensitiveFieldScrubber>()
    .Enrich.FromLogContext()
    .WriteTo.Sink(new InMemorySink())
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();
builder.Services.AddControllers();
builder.Services.AddSingleton<IPkceVerifier, PkceVerifier>();

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>() ?? new JwtSettings();
if (string.IsNullOrWhiteSpace(jwt.SigningKey))
{
    if (builder.Environment.IsProduction())
        throw new InvalidOperationException("Jwt:SigningKey must be configured in Production.");
    jwt.SigningKey = "dev-only-signing-key-not-for-production-use-32-bytes-min";
}
builder.Services.AddSingleton(jwt);
builder.Services.AddSingleton<ITokenService, TokenService>();

var app = builder.Build();

// traces_to: L2-096
app.UseMiddleware<TheUpperRoom.Api.Auth.CsrfMiddleware>();

// traces_to: L2-092
app.Use(async (ctx, next) =>
{
    var headers = ctx.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Cross-Origin-Opener-Policy"] = "same-origin";
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
    headers["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data:; " +
        "connect-src 'self'; " +
        "frame-ancestors 'none'";
    await next();
});

app.Use(async (ctx, next) =>
{
    var correlationId = ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault()
        ?? Guid.NewGuid().ToString();
    ctx.Response.Headers["X-Correlation-Id"] = correlationId;
    using (LogContext.PushProperty("CorrelationId", correlationId))
        await next();
});

app.UseSerilogRequestLogging();
app.MapControllers();

app.Run();

public partial class Program;
