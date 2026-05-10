using Microsoft.EntityFrameworkCore;

namespace TheUpperRoom.Application.Ideas;

public interface IIdeasDbContext
{
    DbSet<IdeaRow> Ideas { get; }
    DbSet<IdeaVoteRow> Votes { get; }
    DbSet<IdeaPartnerRow> Partners { get; }
    DbSet<IdeaCommentRow> Comments { get; }

    int SaveChanges();
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
