using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Application.Users;

namespace TheUpperRoom.Infrastructure.Users;

internal sealed class UserDirectory : IUserDirectory
{
    private readonly UsersDbContext _db;

    public UserDirectory(UsersDbContext db) => _db = db;

    public AppUser? GetById(string id)
    {
        if (string.IsNullOrEmpty(id)) return null;
        var row = _db.Users.Find(id);
        return row is null ? null : new AppUser(row.Id, row.Email, row.City, row.Role);
    }

    public IReadOnlyCollection<AppUser> All() =>
        _db.Users
            .AsNoTracking()
            .Select(r => new AppUser(r.Id, r.Email, r.City, r.Role))
            .ToList();
}
