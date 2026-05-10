// traces_to: L2-079
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TheUpperRoom.Api.Auth;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Users;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Infrastructure.Contacts;

namespace TheUpperRoom.Api.Contacts;

[ApiController]
[Authorize]
[Route("api/v1/contacts")]
public sealed class ContactsController(IMediator mediator, ICurrentUser currentUser) : ControllerBase
{
    // Helpers retained for cross-controller usage (Dashboard, Search). They
    // are pure functions over an injected DbContext and the caller's
    // city-scope visibility; they do not reach into the http context.
    internal static int StoreCount(AppUser user, ContactsDbContext db, bool canSeeAllCities) =>
        canSeeAllCities
            ? db.Contacts.Count()
            : db.Contacts.Count(c => c.CityId == user.City);

    internal static IEnumerable<Contact> Search(string term, AppUser user, ContactsDbContext db, bool canSeeAllCities)
    {
        var query = canSeeAllCities
            ? db.Contacts.AsEnumerable()
            : db.Contacts.Where(c => c.CityId == user.City).AsEnumerable();
        return query.Where(c => c.Name.Contains(term, StringComparison.OrdinalIgnoreCase))
                    .Select(ContactsMapping.ToContact);
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? search,
        [FromQuery] int? page,
        [FromQuery] int? size,
        [FromQuery] string? scope,
        [FromQuery] bool includeArchived,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ListContactsQuery(currentUser.UserId ?? "", search, page, size, scope, includeArchived),
            cancellationToken);

        return result.Outcome switch
        {
            ContactsOutcome.Unauthorized => Unauthorized(),
            ContactsOutcome.Forbidden => StatusCode(403, new { error = "Forbidden" }),
            ContactsOutcome.Ok => Ok(new { items = result.Items, total = result.Total }),
            _ => StatusCode(500),
        };
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Contact>> GetById(string id, [FromQuery] string? scope, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetContactQuery(currentUser.UserId ?? "", id, scope), cancellationToken);
        return result.Outcome switch
        {
            ContactsOutcome.Unauthorized => Unauthorized(),
            ContactsOutcome.Forbidden => StatusCode(403, new { error = "Forbidden" }),
            ContactsOutcome.NotFound => NotFound(),
            ContactsOutcome.Ok => Ok(result.Contact),
            _ => StatusCode(500),
        };
    }

    [HttpPost]
    public async Task<ActionResult<Contact>> Create([FromBody] CreateContactRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateContactCommand(currentUser.UserId ?? "", body), cancellationToken);
        return MapMutate(result, created: c => Created($"/api/v1/contacts/{c.Id}", c));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Contact>> Update(string id, [FromBody] CreateContactRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateContactCommand(currentUser.UserId ?? "", id, body), cancellationToken);
        return MapMutate(result);
    }

    [HttpPatch("{id}")]
    public async Task<ActionResult<Contact>> Patch(string id, [FromBody] PatchContactRequest? body, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new PatchContactCommand(currentUser.UserId ?? "", id, body), cancellationToken);
        return MapMutate(result);
    }

    [HttpPost("{id}/archive")]
    public async Task<IActionResult> Archive(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new SetContactArchivedCommand(currentUser.UserId ?? "", id, true), cancellationToken);
        return result.Outcome switch
        {
            ContactsOutcome.Unauthorized => Unauthorized(),
            ContactsOutcome.NotFound => NotFound(),
            ContactsOutcome.NoContent => NoContent(),
            _ => StatusCode(500),
        };
    }

    [HttpPost("{id}/unarchive")]
    public async Task<IActionResult> Unarchive(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new SetContactArchivedCommand(currentUser.UserId ?? "", id, false), cancellationToken);
        return result.Outcome switch
        {
            ContactsOutcome.Unauthorized => Unauthorized(),
            ContactsOutcome.NotFound => NotFound(),
            ContactsOutcome.NoContent => NoContent(),
            _ => StatusCode(500),
        };
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteContactCommand(currentUser.UserId ?? "", id), cancellationToken);
        return result.Outcome switch
        {
            ContactsOutcome.Unauthorized => Unauthorized(),
            ContactsOutcome.NotFound => NotFound(),
            ContactsOutcome.NoContent => NoContent(),
            _ => StatusCode(500),
        };
    }

    private ActionResult<Contact> MapMutate(MutateContactResult result, Func<Contact, ActionResult>? created = null) => result.Outcome switch
    {
        ContactsOutcome.Unauthorized => Unauthorized(),
        ContactsOutcome.BadRequest => BadRequest(),
        ContactsOutcome.NotFound => NotFound(),
        ContactsOutcome.Unprocessable => UnprocessableEntity(new { error = result.Error }),
        ContactsOutcome.Created when created is not null => created(result.Contact!),
        ContactsOutcome.Created => Created(string.Empty, result.Contact),
        ContactsOutcome.Ok => Ok(result.Contact),
        _ => StatusCode(500),
    };
}
