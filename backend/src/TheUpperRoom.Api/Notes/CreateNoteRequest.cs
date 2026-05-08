// traces_to: L2-041
namespace TheUpperRoom.Api.Notes;

public sealed record CreateNoteRequest(string SubjectType, string SubjectId, string BodyMarkdown);
