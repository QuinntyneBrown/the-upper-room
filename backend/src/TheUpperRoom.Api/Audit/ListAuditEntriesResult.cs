namespace TheUpperRoom.Api.Audit;

public sealed record ListAuditEntriesResult(
    IReadOnlyList<AuditEntryDto> Items,
    int Total,
    int Page,
    int PageSize,
    ListAuditEntriesOutcome Outcome);
