namespace TheUpperRoom.Api.Notes;

public sealed record NoteResult(NoteDto? Note, NotesOutcome Outcome, string? Error);
