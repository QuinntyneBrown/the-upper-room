// traces_to: L2-041
namespace TheUpperRoom.Application.Notes;

public sealed record CreateNoteRequest(string SubjectType, string SubjectId, string BodyMarkdown);
