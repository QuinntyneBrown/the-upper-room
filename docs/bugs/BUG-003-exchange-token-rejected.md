# BUG-003 — Token issued by `/auth/exchange` is rejected by every authorized controller (RESOLVED 2026-05-10)

**Severity**: Critical
**Component**: backend
**Found in test**: TC-2.1 (post-sign-in API access), every protected resource test
**Found**: 2026-05-09
**Status**: FIXED 2026-05-10
- New `IAuthorizationCodeStore` (singleton, in-memory) maps short-lived single-use authorization codes to `(userId, codeChallenge)` records.
- New dev `POST /__idp/authorize` endpoint validates email/password against the real user store via `SignInCommand`, then issues a code bound to the supplied PKCE `code_challenge`.
- `AuthController.Exchange` now `Consume`s the code, verifies the PKCE `code_verifier` against the stored challenge, and issues `IssueAccessToken(record.UserId)` for the **real** user (no more hard-coded `"anonymous"`).
- 4 new xUnit tests in `Auth/PkceExchangeRoundTripTests.cs` plus updated `Auth/ExchangeEndpointTests.cs`. The full round-trip now produces a JWT whose `sub` is the real user id and whose `Bearer` token authenticates against `/api/v1/auth/me`. All 13 auth tests across PkceExchange / Exchange / SignIn / AuthFlow suites pass.

## Description

`POST /api/v1/auth/exchange` is the only endpoint that successfully mints a JWT, but the `sub` claim is hard-coded to the literal string `"anonymous"`. Every protected controller resolves the current user by looking that string up in `SeedUsers.ById`, where it is absent — so every authorized request returns `401`. The exchange-issued token is functionally useless except for `GET /api/v1/auth/me`.

## Reproduction

```bash
VERIFIER="dev-test-verifier-1234567890abcdefghij"
CHALLENGE=$(printf "%s" "$VERIFIER" | openssl dgst -sha256 -binary | openssl base64 -A | tr -d '=' | tr '+/' '-_')

TOKEN=$(curl -s -X POST http://localhost:5255/api/v1/auth/exchange \
  -H "Content-Type: application/json" \
  -d "{\"code\":\"x\",\"codeVerifier\":\"$VERIFIER\",\"expectedChallenge\":\"$CHALLENGE\"}" \
  | python -c 'import sys,json;print(json.load(sys.stdin)["accessToken"])')

# Decoding the token shows: { "sub": "anonymous", ... }

for ep in /api/v1/contacts /api/v1/partners /api/v1/boards /api/v1/ideas \
          /api/v1/events /api/v1/locations /api/v1/notes /api/v1/notifications \
          /api/v1/dashboard /api/v1/admin/audit "/api/v1/search?q=test"; do
  printf "%s -> %s\n" "$ep" \
    "$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:5255${ep})"
done
# Every endpoint returns 401.
# Only /api/v1/auth/me returns 200, with body {"userId":"anonymous","currentUserId":"anonymous"}.
```

## Expected

After completing the PKCE exchange, the issued access token should grant the same access the underlying user would have via sign-in. Calling, e.g., `GET /api/v1/contacts` with that token should return the contact list (or `403` if the user lacks the role).

## Actual

`backend/src/TheUpperRoom.Api/Auth/AuthController.cs:100`:

```csharp
return Ok(new ExchangeResponse(_tokens.IssueAccessToken("anonymous")));
```

Every protected controller (e.g. `ContactsController.cs:51` and 16 others updated by `TASK-0222`) resolves the current user with:

```csharp
var userId = User.FindFirst("sub")?.Value ?? "";
return string.IsNullOrEmpty(userId) || !SeedUsers.ById.TryGetValue(userId, out var user)
    ? null
    : user;
```

`"anonymous"` is not in `SeedUsers.ById`, so `GetCurrentUser()` returns null and each handler returns `Unauthorized()`.

## Suggested fix

The exchange endpoint must bind the issued token to a real user. Two options:

1. After the PKCE check, look the user up via the `code` parameter (which currently is unvalidated) — typically a one-time auth code recorded during the OAuth/OIDC redirect.
2. Until proper IdP integration is done, accept a `userId` (or a sign-in payload) on the exchange request and validate it against `SeedUsers` for dev convenience.

Either way, replace the literal `"anonymous"` with the resolved user id.
