// traces_to: L2-080, L2-015, L2-023, L2-079, L2-097
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Api.Contacts;
using TheUpperRoom.Api.Events;
using TheUpperRoom.Api.ExceptionHandling;
using TheUpperRoom.Api.Ideas;
using TheUpperRoom.Api.Kanban;
using TheUpperRoom.Api.Locations;
using TheUpperRoom.Application.Kanban;
using TheUpperRoom.Application.Notes;
using TheUpperRoom.Api.Notes;
using TheUpperRoom.Api.Notifications;
using TheUpperRoom.Application;
using TheUpperRoom.Infrastructure;
using TheUpperRoom.Infrastructure.Cities;
using TheUpperRoom.Infrastructure.Contacts;
using TheUpperRoom.Infrastructure.Events;
using TheUpperRoom.Infrastructure.Ideas;
using TheUpperRoom.Infrastructure.Kanban;
using TheUpperRoom.Infrastructure.Locations;
using TheUpperRoom.Infrastructure.Notes;
using TheUpperRoom.Infrastructure.Notifications;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.TimestampFormat = "O";
});
builder.Logging.AddFilter("Microsoft.EntityFrameworkCore", LogLevel.Warning);
builder.Services.AddControllers();
builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<IPkceVerifier, PkceVerifier>();
builder.Services.AddSingleton<IAuthorizationCodeStore, InMemoryAuthorizationCodeStore>();
var authRateLimitRedis = builder.Configuration["AuthRateLimit:RedisConnectionString"]
    ?? builder.Configuration["Redis:ConnectionString"];
if (string.IsNullOrWhiteSpace(authRateLimitRedis))
{
    if (builder.Environment.IsProduction())
        throw new InvalidOperationException("AuthRateLimit:RedisConnectionString or Redis:ConnectionString must be configured in Production.");

    builder.Services.AddDistributedMemoryCache();
}
else
{
    builder.Services.AddStackExchangeRedisCache(options =>
    {
        options.Configuration = authRateLimitRedis;
        options.InstanceName = "the-upper-room:auth:";
    });
}
builder.Services.AddSingleton<IAuthRateLimiter, AuthRateLimiter>();

builder.Services.AddApplication(typeof(Program).Assembly);
builder.Services.AddInfrastructure(builder.Configuration);

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

var citiesConn = builder.Configuration["CitiesDb:ConnectionString"]
                 ?? "Data Source=Data/cities.db";
EnsureSqliteDirectoryExists(citiesConn);
builder.Services.AddDbContext<CitiesDbContext>(o => o.UseSqlite(citiesConn));

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
builder.Services.AddScoped<INotesDbContext>(sp => sp.GetRequiredService<NotesDbContext>());

var kanbanConn = builder.Configuration["KanbanDb:ConnectionString"]
                 ?? "Data Source=Data/kanban.db";
EnsureSqliteDirectoryExists(kanbanConn);
builder.Services.AddDbContext<KanbanDbContext>(o => o.UseSqlite(kanbanConn));
builder.Services.AddScoped<IKanbanDbContext>(sp => sp.GetRequiredService<KanbanDbContext>());

var notificationsConn = builder.Configuration["NotificationsDb:ConnectionString"]
                        ?? "Data Source=Data/notifications.db";
EnsureSqliteDirectoryExists(notificationsConn);
builder.Services.AddDbContext<NotificationsDbContext>(o => o.UseSqlite(notificationsConn));
builder.Services.AddScoped<MailStore>();

var pushConn = builder.Configuration["PushDb:ConnectionString"]
               ?? "Data Source=Data/push.db";
EnsureSqliteDirectoryExists(pushConn);
builder.Services.AddDbContext<PushDbContext>(o => o.UseSqlite(pushConn));
builder.Services.AddScoped<PushDispatcher>();
builder.Services.AddSeeders(typeof(Program).Assembly);

var pushSettings = builder.Configuration.GetSection("Push").Get<PushSettings>() ?? new PushSettings();
if (string.IsNullOrWhiteSpace(pushSettings.VapidPublicKey))
{
    if (builder.Environment.IsProduction())
        throw new InvalidOperationException("Push:VapidPublicKey must be configured in Production.");
    pushSettings.VapidPublicKey = "BDevOnlyVapidPublicKeyPlaceholderForLocalDevelopment";
}
builder.Services.AddSingleton(pushSettings);

var usersConn = builder.Configuration["UsersDb:ConnectionString"]
                ?? "Data Source=Data/users.db";
EnsureSqliteDirectoryExists(usersConn);

var app = builder.Build();
app.UseExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<CitiesDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<ContactsDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<EventsDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<IdeasDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<LocationsDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<NotesDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<KanbanDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<NotificationsDbContext>().Database.EnsureCreated();
    scope.ServiceProvider.GetRequiredService<PushDbContext>().Database.EnsureCreated();
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

    using (app.Logger.BeginScope(new Dictionary<string, object?>
    {
        ["CorrelationId"] = correlationId,
    }))
    {
        try
        {
            await next();
        }
        finally
        {
            app.Logger.LogInformation(
                "HTTP {Method} {Path} responded {StatusCode}",
                ctx.Request.Method,
                ctx.Request.Path.Value,
                ctx.Response.StatusCode);
        }
    }
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program;
