// traces_to: L2-080, L2-015, L2-023, L2-079, L2-097
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Context;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Contacts;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Kanban;
using TheUpperRoom.Api.Locations;
using TheUpperRoom.Api.Logging;
using TheUpperRoom.Api.Notes;

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
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt.Issuer,
            ValidAudience = jwt.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
            ClockSkew = TimeSpan.Zero,
        };
    });
builder.Services.AddAuthorization();

var contactsConn = builder.Configuration["ContactsDb:ConnectionString"]
                   ?? "Data Source=Data/contacts.db";
EnsureSqliteDirectoryExists(contactsConn);
builder.Services.AddDbContext<ContactsDbContext>(o => o.UseSqlite(contactsConn));

var eventsConn = builder.Configuration["EventsDb:ConnectionString"]
                 ?? "Data Source=Data/events.db";
EnsureSqliteDirectoryExists(eventsConn);
builder.Services.AddDbContext<EventsDbContext>(o => o.UseSqlite(eventsConn));

var ideasConn = builder.Configuration["IdeasDb:ConnectionString"]
                ?? "Data Source=Data/ideas.db";
EnsureSqliteDirectoryExists(ideasConn);
builder.Services.AddDbContext<IdeasDbContext>(o => o.UseSqlite(ideasConn));

var locationsConn = builder.Configuration["LocationsDb:ConnectionString"]
                    ?? "Data Source=Data/locations.db";
EnsureSqliteDirectoryExists(locationsConn);
builder.Services.AddDbContext<LocationsDbContext>(o => o.UseSqlite(locationsConn));

var notesConn = builder.Configuration["NotesDb:ConnectionString"]
                ?? "Data Source=Data/notes.db";
EnsureSqliteDirectoryExists(notesConn);
builder.Services.AddDbContext<NotesDbContext>(o => o.UseSqlite(notesConn));

var kanbanConn = builder.Configuration["KanbanDb:ConnectionString"]
                 ?? "Data Source=Data/kanban.db";
EnsureSqliteDirectoryExists(kanbanConn);
builder.Services.AddDbContext<KanbanDbContext>(o => o.UseSqlite(kanbanConn));

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var contactsDb = scope.ServiceProvider.GetRequiredService<ContactsDbContext>();
    contactsDb.Database.EnsureCreated();
    SeedSeedContactsIfMissing(contactsDb);

    scope.ServiceProvider.GetRequiredService<EventsDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<IdeasDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<LocationsDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<NotesDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<KanbanDbContext>().Database.EnsureCreated();
}

static void SeedSeedContactsIfMissing(ContactsDbContext db)
{
    // Idempotent: ignore unique-key conflicts caused by parallel test hosts
    // racing on the same connection string.
    try
    {
        if (db.Contacts.Find("c1") is not null) return;
        db.Contacts.Add(new ContactRow { Id = "c1", Name = "Alice", CityId = "Toronto" });
        db.Contacts.Add(new ContactRow { Id = "c2", Name = "Bob", CityId = "Halifax" });
        db.SaveChanges();
    }
    catch (Microsoft.EntityFrameworkCore.DbUpdateException)
    {
        // Another host instance won the race; the rows already exist.
    }
}

static void EnsureSqliteDirectoryExists(string connectionString)
{
    var path = connectionString.Replace("Data Source=", "", StringComparison.OrdinalIgnoreCase).Trim();
    var dir = Path.GetDirectoryName(Path.GetFullPath(path));
    if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
}

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
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program;
