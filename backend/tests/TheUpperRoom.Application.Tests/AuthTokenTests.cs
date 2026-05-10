using System.Text.RegularExpressions;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Application.Tests;

public sealed class AuthTokenTests
{
    [Fact]
    public void Create_returns_url_safe_base64_with_no_padding()
    {
        var token = AuthToken.Create();

        // No `=` padding, no `+` or `/` (the unsafe characters URL-safe base64 replaces).
        Assert.DoesNotContain("=", token);
        Assert.DoesNotContain("+", token);
        Assert.DoesNotContain("/", token);
        // Whatever charset, only [A-Za-z0-9_-].
        Assert.Matches(new Regex("^[A-Za-z0-9_-]+$"), token);
    }

    [Fact]
    public void Create_yields_unique_tokens_across_calls()
    {
        var tokens = Enumerable.Range(0, 50).Select(_ => AuthToken.Create()).ToHashSet();
        Assert.Equal(50, tokens.Count);
    }

    [Fact]
    public void Create_returns_token_with_at_least_32_bytes_of_entropy()
    {
        // 32 bytes -> ~43 base64 chars (after stripping padding).
        var token = AuthToken.Create();
        Assert.True(token.Length >= 42, $"Expected ~43 chars, got {token.Length}");
    }

    [Fact]
    public void Hash_returns_hex_uppercase_sha256_of_input()
    {
        var hash = AuthToken.Hash("hello");

        // SHA-256 of "hello" = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
        Assert.Equal(
            "2CF24DBA5FB0A30E26E83B2AC5B9E29E1B161E5C1FA7425E73043362938B9824",
            hash);
    }

    [Fact]
    public void Hash_is_deterministic_for_same_input()
    {
        var a = AuthToken.Hash("token-xyz");
        var b = AuthToken.Hash("token-xyz");
        Assert.Equal(a, b);
    }

    [Fact]
    public void Hash_trims_whitespace_before_hashing()
    {
        // Pad with spaces; should match the un-padded hash.
        Assert.Equal(AuthToken.Hash("token"), AuthToken.Hash("  token  "));
    }

    [Fact]
    public void Hash_distinguishes_different_inputs()
    {
        Assert.NotEqual(AuthToken.Hash("a"), AuthToken.Hash("b"));
    }
}
