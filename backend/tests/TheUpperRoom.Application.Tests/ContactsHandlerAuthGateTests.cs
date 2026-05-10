using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Rbac;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Rbac;

namespace TheUpperRoom.Application.Tests;

// Pins the auth gate on the Contacts mutating + reading handlers.
// Each short-circuits to Unauthorized before touching IContactsDbContext;
// the throwing stub surfaces gate-bypass regressions.
public sealed class ContactsHandlerAuthGateTests
{
    private static ISender NewSender(bool userKnown, bool canSwitchCity = false)
    {
        var services = new ServiceCollection();
        services.AddSingleton<IUserDirectory>(new StubDirectory(userKnown));
        services.AddSingleton<IContactsDbContext>(new StubContactsDb());
        services.AddSingleton<IPermissionChecker>(new StubPermissions(canSwitchCity));
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
    public async Task GetContact_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new GetContactQuery("missing", "c-1", null));

        Assert.Equal(ContactsOutcome.Unauthorized, result.Outcome);
        Assert.Null(result.Contact);
    }

    [Fact]
    public async Task GetContact_returns_Forbidden_when_all_scope_without_city_switch()
    {
        var sender = NewSender(userKnown: true, canSwitchCity: false);

        var result = await sender.Send(new GetContactQuery("user-1", "c-1", "all"));

        Assert.Equal(ContactsOutcome.Forbidden, result.Outcome);
    }

    [Fact]
    public async Task ListContacts_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new ListContactsQuery("missing", null, null, null, null));

        Assert.Equal(ContactsOutcome.Unauthorized, result.Outcome);
        Assert.Empty(result.Items);
        Assert.Equal(0, result.Total);
    }

    [Fact]
    public async Task UpdateContact_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new UpdateContactCommand("missing", "c-1",
            new CreateContactRequest("Ada", "Lovelace", null, null, null, null)));

        Assert.Equal(ContactsOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task UpdateContact_returns_BadRequest_when_body_is_null()
    {
        var sender = NewSender(userKnown: true);

        var result = await sender.Send(new UpdateContactCommand("user-1", "c-1", Body: null));

        Assert.Equal(ContactsOutcome.BadRequest, result.Outcome);
    }

    [Fact]
    public async Task ListContacts_returns_Forbidden_when_cross_city_scope_without_switch()
    {
        var sender = NewSender(userKnown: true, canSwitchCity: false);

        var result = await sender.Send(new ListContactsQuery(
            "user-1", null, null, null, Scope: "other-city"));

        Assert.Equal(ContactsOutcome.Forbidden, result.Outcome);
    }

    [Fact]
    public async Task PatchContact_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new PatchContactCommand(
            "missing", "c-1", new PatchContactRequest("Renamed")));

        Assert.Equal(ContactsOutcome.Unauthorized, result.Outcome);
    }

    [Fact]
    public async Task SetContactArchived_returns_Unauthorized_when_user_unknown()
    {
        var sender = NewSender(userKnown: false);

        var result = await sender.Send(new SetContactArchivedCommand(
            "missing", "c-1", Archived: true));

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

    private sealed class StubPermissions(bool canSwitchCity) : IPermissionChecker
    {
        public IReadOnlyCollection<Permission> PermissionsFor(string roleName) => [];
        public bool HasPermission(string roleName, string resource, string action) =>
            canSwitchCity
            && resource == PermissionResources.City
            && action == PermissionActions.Switch;
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
