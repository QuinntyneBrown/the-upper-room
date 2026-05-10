namespace TheUpperRoom.Api.Notes;

public sealed record ListNotesResult(NoteDto[] Items, NotesOutcome Outcome, string? Error);
