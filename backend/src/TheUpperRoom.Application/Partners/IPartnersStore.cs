namespace TheUpperRoom.Application.Partners;

/// <summary>
/// Application-level partners read surface. The current production
/// implementation is the in-memory <c>InMemoryPartnersStore</c> hosted in
/// <c>Api/</c>; cross-feature consumers (Dashboard, Search) depend on this
/// interface so they don't have to reach into the Api project.
/// </summary>
public interface IPartnersStore
{
    int CountActive();
}
