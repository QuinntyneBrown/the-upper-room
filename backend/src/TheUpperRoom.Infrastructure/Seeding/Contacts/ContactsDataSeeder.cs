using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Infrastructure.Seeding.Contacts;

internal sealed class ContactsDataSeeder : IDataSeeder
{
    private readonly ContactsDbContext _db;
    private readonly ILogger<ContactsDataSeeder> _logger;

    public ContactsDataSeeder(ContactsDbContext db, ILogger<ContactsDataSeeder> logger)
    {
        _db = db;
        _logger = logger;
    }

    public int Order => 10;

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _db.Database.EnsureCreatedAsync(cancellationToken).ConfigureAwait(false);

        try
        {
            if (await _db.Contacts.FindAsync([(object)"c1"], cancellationToken).ConfigureAwait(false) is not null)
            {
                return;
            }

            _db.Contacts.Add(new ContactRow { Id = "c1", Name = "Alice", CityId = "Toronto" });
            _db.Contacts.Add(new ContactRow { Id = "c2", Name = "Bob", CityId = "Halifax" });
            await _db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            _logger.LogInformation("ContactsDataSeeder: inserted dev contacts.");
        }
        catch (DbUpdateException ex)
        {
            _logger.LogWarning(ex, "ContactsDataSeeder: insert collision (parallel host); ignoring.");
        }
    }
}
