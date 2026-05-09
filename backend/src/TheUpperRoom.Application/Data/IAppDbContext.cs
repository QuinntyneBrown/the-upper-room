using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Domain.Audit;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Domain.Contacts;
using TheUpperRoom.Domain.Events;
using TheUpperRoom.Domain.Ideas;
using TheUpperRoom.Domain.Kanban;
using TheUpperRoom.Domain.Locations;
using TheUpperRoom.Domain.Notes;
using TheUpperRoom.Domain.Notifications;
using TheUpperRoom.Domain.Partners;
using TheUpperRoom.Domain.Tags;
using TheUpperRoom.Domain.Users;

namespace TheUpperRoom.Application.Data;

public interface IAppDbContext
{
    DbSet<City> Cities { get; }
    DbSet<Tag> Tags { get; }
    DbSet<Contact> Contacts { get; }
    DbSet<Partner> Partners { get; }
    DbSet<Location> Locations { get; }
    DbSet<Event> Events { get; }
    DbSet<EventAttendee> EventAttendees { get; }
    DbSet<Idea> Ideas { get; }
    DbSet<KanbanBoard> KanbanBoards { get; }
    DbSet<KanbanColumn> KanbanColumns { get; }
    DbSet<KanbanSwimlane> KanbanSwimlanes { get; }
    DbSet<KanbanCard> KanbanCards { get; }
    DbSet<Note> Notes { get; }
    DbSet<User> Users { get; }
    DbSet<UserSession> UserSessions { get; }
    DbSet<Invitation> Invitations { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<NotificationPreference> NotificationPreferences { get; }
    DbSet<AuditEntry> AuditEntries { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
