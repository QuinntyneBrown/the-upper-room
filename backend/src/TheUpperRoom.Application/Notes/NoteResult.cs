namespace TheUpperRoom.Application.Notes;

public sealed record NoteResult(NoteDto? Note, NotesOutcome Outcome, string? Error);
