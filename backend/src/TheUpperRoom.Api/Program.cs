// traces_to: L2-080, L2-015, L2-023, L2-079, L2-097
using Serilog;
using Serilog.Context;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Logging;

Log.Logger = new LoggerConfiguration()
    .Enrich.With<SensitiveFieldScrubber>()
    .Enrich.FromLogContext()
    .WriteTo.Sink(new InMemorySink())
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);
builder.Host.UseSerilog();
builder.Services.AddControllers();
builder.Services.AddSingleton<IPkceVerifier, PkceVerifier>();

var app = builder.Build();

app.Use(async (ctx, next) =>
{
    var correlationId = ctx.Request.Headers["X-Correlation-Id"].FirstOrDefault()
        ?? Guid.NewGuid().ToString();
    ctx.Response.Headers["X-Correlation-Id"] = correlationId;
    using (LogContext.PushProperty("CorrelationId", correlationId))
        await next();
});

app.MapControllers();

app.Run();

public partial class Program;
