using TheUpperRoom.Application.Notes;
using TheUpperRoom.Domain.Notes;

namespace TheUpperRoom.Application.Tests;

public sealed class NoteDtoFromTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static Note NewNote() =>
        new(NoteSubjectType.Contact, "contact-1",
            "raw markdown", "<p>html</p>",
            "creator", Utc);

    [Fact]
    public void From_copies_basic_fields()
    {
        var note = NewNote();

        var dto = NoteDto.From(note);

        Assert.Equal(note.Id, dto.Id);
        Assert.Equal("Contact", dto.SubjectType);
        Assert.Equal("contact-1", dto.SubjectId);
        Assert.Equal("raw markdown", dto.BodyMarkdown);
        Assert.Equal("<p>html</p>", dto.BodyHtmlSanitized);
        Assert.Equal("creator", dto.CreatedBy);
        Assert.Equal(Utc, dto.CreatedAt);
        Assert.Equal(Utc, dto.UpdatedAt);
    }

    [Fact]
    public void From_renders_subject_type_as_string_name()
    {
        var note = new Note(
            NoteSubjectType.Partner, "partner-1", "md", "<p>html</p>",
            "creator", Utc);

        var dto = NoteDto.From(note);

        // The DTO carries a string so the wire format doesn't drift if
        // the enum is renumbered.
        Assert.Equal("Partner", dto.SubjectType);
    }

    [Fact]
    public void From_projects_empty_history_when_note_has_never_been_updated()
    {
        var dto = NoteDto.From(NewNote());

        Assert.Empty(dto.History);
    }

    [Fact]
    public void From_projects_history_in_order_with_full_field_copy()
    {
        var note = NewNote();
        note.UpdateBody("v1", "<p>v1</p>", "u1", Utc.AddMinutes(1));
        note.UpdateBody("v2", "<p>v2</p>", "u2", Utc.AddMinutes(2));

        var dto = NoteDto.From(note);

        Assert.Equal(2, dto.History.Length);
        // Newest history entry first (matches Note's insert-at-head behaviour).
        Assert.Equal("v1", dto.History[0].BodyMarkdown);
        Assert.Equal("<p>v1</p>", dto.History[0].BodyHtmlSanitized);
        // Oldest history entry is the original body (the initial state).
        Assert.Equal("raw markdown", dto.History[1].BodyMarkdown);
    }

    [Fact]
    public void From_history_dto_carries_creator_and_timestamp_of_prior_version()
    {
        var note = NewNote();
        note.UpdateBody("v1", "<p>v1</p>", "editor", Utc.AddMinutes(1));

        var dto = NoteDto.From(note);

        var head = dto.History[0];
        Assert.Equal("creator", head.CreatedBy); // who wrote the prior body
        Assert.Equal(Utc, head.CreatedAt);       // when the prior body was created
    }
}
