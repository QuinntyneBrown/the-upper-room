using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TheUpperRoom.Api.Auth;

namespace TheUpperRoom.Application.Tests;

public sealed class AuthUserManagementTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public AuthUserManagementTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_verify_change_password_and_delete_account_flow()
    {
        var client = _factory.CreateClient();
        var email = $"user-{Guid.NewGuid():N}@test.local";
        const string originalPassword = "UpperRoomDev!42";
        const string newPassword = "UpperRoomDev!43";

        var register = await client.PostAsJsonAsync(
            "/api/v1/auth/register",
            new { email, password = originalPassword });
        Assert.Equal(HttpStatusCode.Created, register.StatusCode);

        var created = await register.Content.ReadFromJsonAsync<RegisterResponse>();
        Assert.False(string.IsNullOrWhiteSpace(created?.UserId));
        Assert.False(string.IsNullOrWhiteSpace(created?.EmailVerificationToken));

        var unverifiedSignIn = await SignInAsync(client, email, originalPassword);
        Assert.Equal(HttpStatusCode.Unauthorized, unverifiedSignIn.StatusCode);

        var verify = await client.PostAsJsonAsync(
            "/api/v1/auth/verify-email",
            new { token = created!.EmailVerificationToken });
        Assert.Equal(HttpStatusCode.NoContent, verify.StatusCode);

        var signIn = await SignInAsync(client, email, originalPassword);
        Assert.Equal(HttpStatusCode.OK, signIn.StatusCode);
        var signInBody = await signIn.Content.ReadFromJsonAsync<ExchangeResponse>();
        Assert.False(string.IsNullOrWhiteSpace(signInBody?.AccessToken));

        var changePassword = await SendAuthedAsync(
            client,
            HttpMethod.Post,
            "/api/v1/auth/change-password",
            signInBody!.AccessToken,
            new { currentPassword = originalPassword, newPassword });
        Assert.Equal(HttpStatusCode.NoContent, changePassword.StatusCode);

        var oldPassword = await SignInAsync(client, email, originalPassword);
        Assert.Equal(HttpStatusCode.Unauthorized, oldPassword.StatusCode);

        var newSignIn = await SignInAsync(client, email, newPassword);
        Assert.Equal(HttpStatusCode.OK, newSignIn.StatusCode);
        var newSignInBody = await newSignIn.Content.ReadFromJsonAsync<ExchangeResponse>();

        var delete = await SendAuthedAsync(
            client,
            HttpMethod.Delete,
            "/api/v1/auth/account",
            newSignInBody!.AccessToken,
            new { currentPassword = newPassword });
        Assert.Equal(HttpStatusCode.NoContent, delete.StatusCode);

        var deletedSignIn = await SignInAsync(client, email, newPassword);
        Assert.Equal(HttpStatusCode.Unauthorized, deletedSignIn.StatusCode);
    }

    private static Task<HttpResponseMessage> SignInAsync(
        HttpClient client,
        string email,
        string password) =>
        client.PostAsJsonAsync("/api/v1/auth/sign-in", new { email, password });

    private static Task<HttpResponseMessage> SendAuthedAsync(
        HttpClient client,
        HttpMethod method,
        string path,
        string accessToken,
        object body)
    {
        var request = new HttpRequestMessage(method, path)
        {
            Content = JsonContent.Create(body),
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return client.SendAsync(request);
    }

    private sealed record RegisterResponse(
        string UserId,
        string EmailVerificationToken);
}
