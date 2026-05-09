using Microsoft.Extensions.Logging;

namespace TheUpperRoom.Infrastructure.Seeding;

internal sealed class SeedingService : ISeedingService
{
    private readonly IEnumerable<IDataSeeder> _seeders;
    private readonly ILogger<SeedingService> _logger;

    public SeedingService(IEnumerable<IDataSeeder> seeders, ILogger<SeedingService> logger)
    {
        _seeders = seeders;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var ordered = _seeders.OrderBy(s => s.Order).ToList();
        _logger.LogInformation("Running {Count} data seeder(s).", ordered.Count);
        foreach (var seeder in ordered)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var name = seeder.GetType().Name;
            _logger.LogInformation("Seeding via {Seeder} (order={Order}).", name, seeder.Order);
            await seeder.SeedAsync(cancellationToken).ConfigureAwait(false);
        }
        _logger.LogInformation("Seeding complete.");
    }
}
