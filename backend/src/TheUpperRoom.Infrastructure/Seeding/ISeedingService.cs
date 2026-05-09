namespace TheUpperRoom.Infrastructure.Seeding;

/// <summary>
/// Populates the application data stores with development-only fixture data.
/// Implementations must be idempotent — calling SeedAsync multiple times
/// must not duplicate rows or throw on existing keys.
/// </summary>
public interface ISeedingService
{
    Task SeedAsync(CancellationToken cancellationToken = default);
}
