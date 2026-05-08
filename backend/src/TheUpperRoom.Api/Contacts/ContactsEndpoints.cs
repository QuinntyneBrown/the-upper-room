// traces_to: L2-079
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using TheUpperRoom.Api.Rbac;
using TheUpperRoom.Application.Cities;

namespace TheUpperRoom.Api.Contacts;

public static class ContactsEndpoints
{
    private static readonly Contact[] Seed =
    {
        new("c1", "Alice", "Toronto"),
        new("c2", "Bob", "Halifax")
    };

    public static IEndpointRouteBuilder MapContactsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/v1/contacts", (HttpContext ctx) =>
        {
            var userId = ctx.Request.Headers["X-Test-User-Id"].ToString();
            if (string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user))
                return Results.Unauthorized();

            var search = ctx.Request.Query["search"].ToString();
            IEnumerable<Contact> items = user.Role == Roles.SystemAdmin
                ? Seed
                : Seed.Where(c => c.CityId == user.City);

            if (!string.IsNullOrEmpty(search))
                items = items.Where(c => c.Name.Contains(search, StringComparison.OrdinalIgnoreCase));

            var result = items.ToArray();
            return Results.Ok(new { items = result, total = result.Length });
        });

        app.MapGet("/api/v1/contacts/{id}", (string id, HttpContext ctx) =>
        {
            var userId = ctx.Request.Headers["X-Test-User-Id"].ToString();
            if (string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user))
            {
                return Results.Unauthorized();
            }

            var contact = Seed.FirstOrDefault(c => c.Id == id);
            if (contact is null) return Results.NotFound();

            var allCities = user.Role == Roles.SystemAdmin
                && ctx.Request.Headers["X-All-Cities"].ToString() == "true";
            if (allCities) return Results.Ok(contact);

            var visible = CityScope.VisibleOrNull(contact, user.City);
            return visible is null ? Results.NotFound() : Results.Ok(visible);
        });
        return app;
    }
}
