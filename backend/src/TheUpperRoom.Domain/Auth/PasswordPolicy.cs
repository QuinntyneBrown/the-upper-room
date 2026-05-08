using System.Text.RegularExpressions;

namespace TheUpperRoom.Domain.Auth;

public sealed partial class PasswordPolicy
{
    public const int MinLength = 12;
    public const int MaxLength = 128;

    private static readonly HashSet<string> CommonPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "password",
        "password1",
        "password!",
        "password1!",
        "qwerty",
        "qwerty123",
        "123456",
        "123456789",
        "letmein",
        "welcome",
        "admin",
        "iloveyou",
        "monkey",
        "dragon"
    };

    public PasswordEvaluation Evaluate(
        string password,
        string userEmail = "",
        string displayName = "",
        bool knownCompromised = false)
    {
        if (knownCompromised || CommonPasswords.Contains(password))
        {
            return new PasswordEvaluation(false, 0, "Password is too common. Choose a stronger password.");
        }

        var rules = new[]
        {
            password.Length >= MinLength && password.Length <= MaxLength,
            password.Any(char.IsUpper),
            password.Any(char.IsLower),
            password.Any(char.IsDigit),
            SymbolRegex().IsMatch(password)
        };
        var score = rules.Count(rule => rule);

        if (ContainsUserIdentifier(password, userEmail, displayName))
        {
            return new PasswordEvaluation(false, Math.Max(0, score - 2), "Password may not contain your email or name.");
        }

        var valid = score == 5;
        return new PasswordEvaluation(
            valid,
            score,
            valid ? null : "Use 12+ characters with upper, lower, digit, and symbol.");
    }

    private static bool ContainsUserIdentifier(string password, string userEmail, string displayName)
    {
        var normalizedPassword = password.ToLowerInvariant();
        var localPart = userEmail.Split('@', 2)[0].Trim().ToLowerInvariant();
        if (localPart.Length >= 3 && normalizedPassword.Contains(localPart, StringComparison.Ordinal))
        {
            return true;
        }

        var nameParts = displayName
            .Split(' ', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(part => part.Length >= 3)
            .Select(part => part.ToLowerInvariant());

        return nameParts.Any(part => normalizedPassword.Contains(part, StringComparison.Ordinal));
    }

    [GeneratedRegex("[!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?]", RegexOptions.CultureInvariant)]
    private static partial Regex SymbolRegex();
}
