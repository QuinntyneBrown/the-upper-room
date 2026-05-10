using TheUpperRoom.Application.Auth;
using TheUpperRoom.Application.Audit;

namespace TheUpperRoom.Application.Tests;

// Auth handlers fan their result enums out to controller branches that
// translate them into specific HTTP status codes (200/201/400/404/409).
// Pinning the surfaces here so a rename or reorder is caught by tests
// rather than by an HTTP regression.
public sealed class AuthOutcomeEnumShapeTests
{
    [Fact]
    public void AuthMutationOutcome_has_exactly_these_members()
    {
        Assert.Equal(
            new[] { "Success", "Created", "Conflict", "InvalidCredentials", "InvalidToken", "NotFound" },
            Enum.GetNames<AuthMutationOutcome>());
    }

    [Fact]
    public void SignInOutcome_has_exactly_these_members()
    {
        Assert.Equal(
            new[] { "Success", "InvalidCredentials", "EmailNotVerified" },
            Enum.GetNames<SignInOutcome>());
    }

    [Fact]
    public void PasswordHashVerificationResult_has_success_failed_rehash()
    {
        var names = Enum.GetNames<PasswordHashVerificationResult>();
        Assert.Contains("Success", names);
        Assert.Contains("Failed", names);
        Assert.Contains("Rehash", names);
    }

    [Fact]
    public void ListAuditEntriesOutcome_includes_success_or_at_minimum_one_member()
    {
        // Guard against silent collapse to empty.
        Assert.NotEmpty(Enum.GetNames<ListAuditEntriesOutcome>());
    }
}
