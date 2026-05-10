using TheUpperRoom.Application.Partners;

namespace TheUpperRoom.Api.Partners;

/// <summary>
/// Thin adapter that lets the cross-feature dashboard handler in
/// <c>Application/Dashboard/</c> read the partner count without reaching
/// into the Api project. Delegates to the in-memory <c>_store</c> hosted on
/// <see cref="PartnersController"/>; the eventual partners DbContext will
/// replace this seam.
/// </summary>
internal sealed class InMemoryPartnersStore : IPartnersStore
{
    public int CountActive() => PartnersController.StoreCount();
}
