namespace TheUpperRoom.Infrastructure.Seeding;

/// <summary>
/// A unit of seed data. Multiple implementations can be registered; the
/// SeedingService runs them in registration order. Implementations must be
/// idempotent.
/// </summary>
public interface IDataSeeder
{
    /// <summary>Used for ordering and log output. Lower runs earlier.</summary>
    int Order => 0;

    Task SeedAsync(CancellationToken cancellationToken = default);
}
