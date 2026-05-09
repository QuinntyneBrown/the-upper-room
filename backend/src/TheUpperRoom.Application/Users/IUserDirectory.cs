namespace TheUpperRoom.Application.Users;

/// <summary>
/// Abstraction over the authenticated-user directory. Implemented in
/// Infrastructure. Returns null when the id is unknown.
/// </summary>
public interface IUserDirectory
{
    AppUser? GetById(string id);
    IReadOnlyCollection<AppUser> All();
}
