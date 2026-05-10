using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using TheUpperRoom.Application.Auth;
using TheUpperRoom.Application.Data;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Infrastructure.Auth;
using TheUpperRoom.Infrastructure.Data;
using TheUpperRoom.Infrastructure.Seeding;
using TheUpperRoom.Infrastructure.Users;

namespace TheUpperRoom.Infrastructure;

public static class DependencyInjection
{
    public const string SqlServerConnectionStringName = "TheUpperRoom";
    public const string UsersDbConnectionKey = "UsersDb:ConnectionString";

    /// <summary>
    /// Registers Infrastructure services: SQLite UsersDbContext, user
    /// directory, password hashing, and seeding pipeline. The hosted service
    /// that triggers seed runs only when the host is in the Development
    /// environment.
    /// </summary>
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var usersConn = configuration[UsersDbConnectionKey] ?? "Data Source=Data/users.db";
        services.AddDbContext<UsersDbContext>(o => o.UseSqlite(usersConn));

        services.AddScoped<IUserDirectory, UserDirectory>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        services.AddSeeders(typeof(DependencyInjection).Assembly);

        return services;
    }

    public static IServiceCollection AddSeeders(
        this IServiceCollection services,
        params Assembly[] assemblies)
    {
        services.TryAddScoped<ISeedingService, SeedingService>();
        services.TryAddEnumerable(ServiceDescriptor.Singleton<IHostedService, SeedingHostedService>());

        foreach (var seederType in assemblies
            .SelectMany(assembly => assembly.DefinedTypes)
            .Where(type => type is { IsAbstract: false, IsInterface: false }
                && type.IsAssignableTo(typeof(IDataSeeder)))
            .Select(type => type.AsType()))
        {
            services.AddScoped(typeof(IDataSeeder), seederType);
        }

        return services;
    }

    /// <summary>
    /// Optional: registers the SQL Server-backed AppDbContext used for design
    /// time / future migration work. Not required for the SQLite-backed Api.
    /// </summary>
    public static IServiceCollection AddAppDbContextSqlServer(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString(SqlServerConnectionStringName)
            ?? throw new InvalidOperationException(
                $"Connection string '{SqlServerConnectionStringName}' is not configured.");

        services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));
        services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<AppDbContext>());
        return services;
    }
}
