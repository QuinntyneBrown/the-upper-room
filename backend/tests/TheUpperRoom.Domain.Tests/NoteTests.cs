using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Domain.Tests;

public sealed class NoteTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Note NewNote(string md = "v0", string html = "<p>v0</p>") =>
        new(NoteSubjectType.Contact, "contact-1", md, html, "creator", Utc);

    [Fact]
    public void Constructor_assigns_subject_body_and_starts_with_empty_history()
    {
        var note = NewNote();

        Assert.Equal(NoteSubjectType.Contact, note.SubjectType);
        Assert.Equal("contact-1", note.SubjectId);
        Assert.Equal("v0", note.BodyMarkdown);
        Assert.Equal("<p>v0</p>", note.BodyHtmlSanitized);
        Assert.Empty(note.History);
    }

    [Fact]
    public void Update_body_pushes_previous_state_to_history_head()
    {
        var note = NewNote();
        var t1 = Utc.AddMinutes(1);

        note.UpdateBody("v1", "<p>v1</p>", "editor", t1);

        Assert.Equal("v1", note.BodyMarkdown);
        Assert.Equal("<p>v1</p>", note.BodyHtmlSanitized);
        var version = Assert.Single(note.History);
        Assert.Equal("v0", version.BodyMarkdown);
        Assert.Equal("<p>v0</p>", version.BodyHtmlSanitized);
        Assert.Equal("creator", version.CreatedBy);
        Assert.Equal(Utc, version.CreatedAt);
    }

    [Fact]
    public void Update_body_inserts_at_head_so_newest_history_comes_first()
    {
        var note = NewNote();
        note.UpdateBody("v1", "<p>v1</p>", "u1", Utc.AddMinutes(1));
        note.UpdateBody("v2", "<p>v2</p>", "u2", Utc.AddMinutes(2));

        Assert.Equal(["v1", "v0"], note.History.Select(h => h.BodyMarkdown));
    }

    [Fact]
    public void History_caps_at_max_versions()
    {
        var note = NewNote();
        for (var i = 1; i <= Note.MaxHistoryVersions + 5; i++)
        {
            note.UpdateBody($"v{i}", $"<p>v{i}</p>", "editor", Utc.AddMinutes(i));
        }

        Assert.Equal(Note.MaxHistoryVersions, note.History.Count);
        // Newest history entry is the body just before the most recent update.
        var expectedNewest = $"v{Note.MaxHistoryVersions + 4}";
        Assert.Equal(expectedNewest, note.History.First().BodyMarkdown);
    }

    [Fact]
    public void Update_body_touches_audit_fields()
    {
        var note = NewNote();
        var t1 = Utc.AddHours(1);

        note.UpdateBody("v1", "<p>v1</p>", "editor", t1);

        Assert.Equal("editor", note.UpdatedBy);
        Assert.Equal(t1, note.UpdatedAt);
        Assert.Equal("creator", note.CreatedBy);
        Assert.Equal(Utc, note.CreatedAt);
    }

    [Fact]
    public void Constructor_rejects_blank_body_markdown()
    {
        Assert.Throws<DomainException>(() =>
            new Note(NoteSubjectType.Contact, "subject-1", "", "<p></p>", "creator", Utc));
    }

    [Fact]
    public void Constructor_rejects_blank_subject_id()
    {
        Assert.Throws<DomainException>(() =>
            new Note(NoteSubjectType.Contact, "", "body", "<p>body</p>", "creator", Utc));
    }
}
