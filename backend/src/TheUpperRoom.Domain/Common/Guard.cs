using System.Text.RegularExpressions;

namespace TheUpperRoom.Domain.Common;

public static partial class Guard
{
    public static string Required(string? value, string field, int maxLength, int minLength = 1)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            throw new DomainException($"{field} is required.");
        }

        if (trimmed.Length < minLength)
        {
            throw new DomainException($"{field} must be at least {minLength} characters.");
        }

        if (trimmed.Length > maxLength)
        {
            throw new DomainException($"{field} must be {maxLength} characters or fewer.");
        }

        return trimmed;
    }

    public static string? Optional(string? value, string field, int maxLength)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            return null;
        }

        if (trimmed.Length > maxLength)
        {
            throw new DomainException($"{field} must be {maxLength} characters or fewer.");
        }

        return trimmed;
    }

    public static string Id(string? value, string field)
    {
        var trimmed = value?.Trim();
        if (string.IsNullOrEmpty(trimmed))
        {
            throw new DomainException($"{field} is required.");
        }

        return trimmed;
    }

    public static int? OptionalRange(int? value, string field, int min, int max)
    {
        if (value is null)
        {
            return null;
        }

        if (value < min || value > max)
        {
            throw new DomainException($"{field} must be between {min} and {max}.");
        }

        return value;
    }

    public static DateTimeOffset Utc(DateTimeOffset value, string field)
    {
        if (value.Offset != TimeSpan.Zero)
        {
            throw new DomainException($"{field} must be UTC.");
        }

        return value;
    }

    public static string? OptionalHttpUrl(string? value, string field, int maxLength = 2048)
    {
        var trimmed = Optional(value, field, maxLength);
        if (trimmed is null)
        {
            return null;
        }

        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new DomainException($"{field} must be a valid http:// or https:// URL.");
        }

        return trimmed;
    }

    public static string RequiredHttpUrl(string value, string field, int maxLength = 2048)
    {
        var trimmed = Required(value, field, maxLength);
        if (!Uri.TryCreate(trimmed, UriKind.Absolute, out var uri)
            || (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps))
        {
            throw new DomainException($"{field} must be a valid http:// or https:// URL.");
        }

        return trimmed;
    }

    public static string E164Phone(string value, string field)
    {
        var trimmed = Required(value, field, 16);
        if (!E164Regex().IsMatch(trimmed))
        {
            throw new DomainException("Enter a valid phone number, e.g. +1 555 123 4567.");
        }

        return trimmed;
    }

    [GeneratedRegex("^\\+[1-9]\\d{1,14}$", RegexOptions.CultureInvariant)]
    private static partial Regex E164Regex();
}
