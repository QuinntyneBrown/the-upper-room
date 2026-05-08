// traces_to: L2-029, L2-030
namespace TheUpperRoom.Api.Tests.Contacts;

internal sealed record PagedEnvelope(ContactDto[] Items, int Total);
