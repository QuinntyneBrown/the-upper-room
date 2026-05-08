// traces_to: L2-080, L2-015
using TheUpperRoom.Api.Auth;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IPkceVerifier, PkceVerifier>();

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));
app.MapAuthEndpoints();

app.Run();

public partial class Program;
