namespace TheUpperRoom.Infrastructure.Cities;

public sealed class CityRow
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public bool Archived { get; set; }
}
