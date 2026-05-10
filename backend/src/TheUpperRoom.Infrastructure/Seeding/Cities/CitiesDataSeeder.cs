using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TheUpperRoom.Infrastructure.Cities;

namespace TheUpperRoom.Infrastructure.Seeding.Cities;

internal sealed class CitiesDataSeeder : IDataSeeder
{
    private readonly CitiesDbContext _db;
    private readonly ILogger<CitiesDataSeeder> _logger;

    public CitiesDataSeeder(CitiesDbContext db, ILogger<CitiesDataSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public int Order => 5;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _db.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);

        var seeds = new[]
        {
            new CityRow { Id = "toronto", Name = "Toronto", Slug = "toronto", Archived = false },
            new CityRow { Id = "halifax", Name = "Halifax", Slug = "halifax", Archived = false },
        };

        var seedIds = seeds.Select(s => s.Id).ToArray();
        var existingIds = await _db.Cities
            .Where(c => seedIds.Contains(c.Id))
            .Select(c => c.Id)
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        var toAdd = seeds.Where(s => !existingIds.Contains(s.Id)).ToArray();
        if (toAdd.Length == 0)
        {
            _logger.LogInformation("CitiesDataSeeder: all dev cities already present.");
            return;
        }

        _db.Cities.AddRange(toAdd);
        try
        {
            await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            _logger.LogInformation("CitiesDataSeeder: inserted {Count} dev city(ies).", toAdd.Length);
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "CitiesDataSeeder: insert collision (parallel host); ignoring.");
        }
    }
}
