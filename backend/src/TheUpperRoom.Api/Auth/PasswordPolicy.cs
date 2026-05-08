// traces_to: L2-019
using System.Text.RegularExpressions;

namespace TheUpperRoom.Api.Auth;

public sealed class PasswordPolicy
{
    private const int MinLen = 12;
    private const int MaxLen = 128;
    private static readonly Regex Symbols = new("[!@#$%^&*()_+\\-=\\[\\]{}|;:'\",.<>/?]", RegexOptions.Compiled);

    private static readonly HashSet<string> CommonPasswords = new(StringComparer.OrdinalIgnoreCase)
    {
        "password", "password1", "password!", "password1!", "qwerty", "qwerty123",
        "123456", "123456789", "letmein", "welcome", "admin", "iloveyou", "monkey", "dragon"
    };

    public PasswordEvaluation Evaluate(string password, string userEmail = "")
    {
        var rules = new[]
        {
            password.Length >= MinLen && password.Length <= MaxLen,
            password.Any(char.IsUpper),
            password.Any(char.IsLower),
            password.Any(char.IsDigit),
            Symbols.IsMatch(password)
        };
        var score = rules.Count(r => r);

        if (CommonPasswords.Contains(password))
        {
            return new PasswordEvaluation(false, 0, "Password is too common. Choose a stronger password.");
        }

        var localPart = userEmail.Split('@', 2)[0].Trim().ToLowerInvariant();
        if (localPart.Length >= 3 && password.ToLowerInvariant().Contains(localPart))
        {
            return new PasswordEvaluation(false, Math.Max(0, score - 2),
                "Password may not contain your email or name.");
        }

        var valid = score == 5;
        return new PasswordEvaluation(valid, score,
            valid ? null : "Use 12+ characters with upper, lower, digit, and symbol.");
    }
}
