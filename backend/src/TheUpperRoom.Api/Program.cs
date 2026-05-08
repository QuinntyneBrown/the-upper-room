// traces_to: L2-080, L2-015, L2-023
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Rbac;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IPkceVerifier, PkceVerifier>();

var app = builder.Build();

app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));
app.MapAuthEndpoints();
app.MapUsersEndpoints();

app.Run();

public partial class Program;
