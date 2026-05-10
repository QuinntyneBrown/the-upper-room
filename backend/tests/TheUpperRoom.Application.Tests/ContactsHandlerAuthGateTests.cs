using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Application.Tests;

// Pins the auth gate on the Contacts mutating + reading handlers.
// Each short-circuits to Unauthorized before touching IContactsDbContext;
// the throwing stub surfaces gate-bypass regressions.
public sealed class ContactsHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddSingleton<IContactsDbContext>(new StubContactsDb());
        services.AddApplication();
        return services.BuildServiceProvider().GetRequiredService<ISender>();
    }

    [Fact]
    public async Task CreateContact_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new CreateContactCommand("missing",
            new CreateContactRequest("Ada", "Lovelace", null, null, null, null)));

        Assert.Equal(ContactsOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Contact);
    }

    [Fact]
    public async Task DeleteContact_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new DeleteContactCommand("missing", "contact-1"));

        Assert.Equal(ContactsOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public void ContactsOutcome_enum_pins_wire_shape()
    {
        Assert.Equal(
            new[] { "Ok", "Created", "NoContent", "Unauthorized", "Forbidden",
                    "NotFound", "BadRequest", "Unprocessable" },
            Enum.GetNames<ContactsOutcome>());
    }

    private sealed class StubDirectory(bool known) : IUserDirectory
    {
        public AppUser? GetById(string id) =>
            known ? new AppUser(id, $"{id}@example.com", "city-1", "Member") : null;
        public IReadOnlyCollection<AppUser> All() => [];
    }

    private sealed class StubContactsDb : IContactsDbContext
    {
        public DbSet<ContactRow> Contacts =>
            throw new InvalidOperationException("Auth gate should not have reached the DB.");
        public int SaveChanges() => throw new InvalidOperationException();
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException();
    }
}
