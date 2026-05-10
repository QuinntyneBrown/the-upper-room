namespace TheUpperRoom.Application.Notes;

public sealed record ListNotesResult(NoteDto[] Items, NotesOutcome Outcome, string? Error);
