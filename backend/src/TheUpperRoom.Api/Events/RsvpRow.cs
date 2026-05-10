namespace TheUpperRoom.Api.Events;

public sealed class RsvpRow
{
    public string EventId { get; set; } = "";
    public string UserId { get; set; } = "";
    public string Status { get; set; } = "";
    public int? WaitlistPosition { get; set; }
}
