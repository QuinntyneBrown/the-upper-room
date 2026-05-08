using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace TheUpperRoom.Infrastructure.Persistence;

internal static class JsonConverters
{
    private static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = false,
    };

    public static ValueConverter<T, string> SingleConverter<T>() => new(
        v => JsonSerializer.Serialize(v, Options),
        v => Deserialize<T>(v)!);

    public static ValueConverter<List<T>, string> ListConverter<T>() => new(
        v => JsonSerializer.Serialize(v, Options),
        v => Deserialize<List<T>>(v) ?? new List<T>());

    public static ValueComparer<List<T>> ListComparer<T>() => new(
        (a, b) => ReferenceEquals(a, b) || (a != null && b != null && a.SequenceEqual(b)),
        v => v == null ? 0 : v.Aggregate(0, (h, e) => HashCode.Combine(h, e)),
        v => v.ToList());

    public static ValueConverter<HashSet<string>, string> StringHashSetConverter() => new(
        v => JsonSerializer.Serialize(v, Options),
        v => Deserialize<HashSet<string>>(v) ?? new HashSet<string>(StringComparer.OrdinalIgnoreCase));

    public static ValueComparer<HashSet<string>> StringHashSetComparer() => new(
        (a, b) => ReferenceEquals(a, b) || (a != null && b != null && a.SetEquals(b)),
        v => v == null ? 0 : v.Aggregate(0, (h, e) => HashCode.Combine(h, e)),
        v => new HashSet<string>(v, StringComparer.OrdinalIgnoreCase));

    public static ValueConverter<Dictionary<string, string?>, string> StringDictionaryConverter() => new(
        v => JsonSerializer.Serialize(v, Options),
        v => Deserialize<Dictionary<string, string?>>(v) ?? new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase));

    public static ValueComparer<Dictionary<string, string?>> StringDictionaryComparer() => new(
        (a, b) => DictionariesEqual(a, b),
        v => v == null ? 0 : v.Aggregate(0, (h, p) => HashCode.Combine(h, p.Key, p.Value)),
        v => new Dictionary<string, string?>(v, StringComparer.OrdinalIgnoreCase));

    private static bool DictionariesEqual(Dictionary<string, string?>? a, Dictionary<string, string?>? b)
    {
        if (ReferenceEquals(a, b)) return true;
        if (a is null || b is null || a.Count != b.Count) return false;
        foreach (var (key, value) in a)
        {
            if (!b.TryGetValue(key, out var other) || !string.Equals(value, other, StringComparison.Ordinal))
            {
                return false;
            }
        }
        return true;
    }

    private static T? Deserialize<T>(string? value) =>
        string.IsNullOrWhiteSpace(value) ? default : JsonSerializer.Deserialize<T>(value, Options);
}
