// traces_to: L2-080, L2-015, L2-023, L2-079
using TheUpperRoom.Api.Auth;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSingleton<IPkceVerifier, PkceVerifier>();

var app = builder.Build();

app.MapControllers();

app.Run();

public partial class Program;
