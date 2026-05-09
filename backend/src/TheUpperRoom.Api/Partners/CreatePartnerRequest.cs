// traces_to: L2-034
namespace TheUpperRoom.Api.Partners;

public sealed record CreatePartnerRequest(string Name, string? Website = null, string? LegalName = null);
