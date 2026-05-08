using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Infrastructure.Persistence;

namespace TheUpperRoom.Infrastructure.Tests.Persistence;

public class AppDbContextModelTests
{
    [Fact]
    public void Model_builds_without_errors()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer("Server=(localdb)\\MSSQLLocalDB;Database=TheUpperRoomModelCheck;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;

        using var context = new AppDbContext(options);

        var model = context.Model;

        Assert.NotEmpty(model.GetEntityTypes());
    }
}
