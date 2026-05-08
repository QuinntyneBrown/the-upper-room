using Microsoft.EntityFrameworkCore;
using TheUpperRoom.Domain.Audit;
using TheUpperRoom.Domain.Cities;
using TheUpperRoom.Domain.Common.ValueObjects;
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

namespace TheUpperRoom.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<City> Cities => Set<City>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Partner> Partners => Set<Partner>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventAttendee> EventAttendees => Set<EventAttendee>();
    public DbSet<Idea> Ideas => Set<Idea>();
    public DbSet<KanbanBoard> KanbanBoards => Set<KanbanBoard>();
    public DbSet<KanbanColumn> KanbanColumns => Set<KanbanColumn>();
    public DbSet<KanbanSwimlane> KanbanSwimlanes => Set<KanbanSwimlane>();
    public DbSet<KanbanCard> KanbanCards => Set<KanbanCard>();
    public DbSet<Note> Notes => Set<Note>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<Invitation> Invitations => Set<Invitation>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Value-object records are stored as JSON via converters on their owning
        // aggregate's backing field. Ignore them at the model root so EF's
        // convention scanner doesn't try to map them as entities or owned types.
        modelBuilder.Ignore<Address>();
        modelBuilder.Ignore<EmailAddress>();
        modelBuilder.Ignore<PhoneNumber>();
        modelBuilder.Ignore<SocialLink>();
        modelBuilder.Ignore<PartnerContactLink>();
        modelBuilder.Ignore<NoteVersion>();
        modelBuilder.Ignore<CardSchemaField>();

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
