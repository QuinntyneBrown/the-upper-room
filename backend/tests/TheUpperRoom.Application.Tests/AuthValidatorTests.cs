// Unit tests for the security-critical Auth validators. The behavioural
// integration test (HTTP 400 application/problem+json) is in
// ValidationProblemDetailsTests; these pin the rules at the unit level.
using FluentValidation.TestHelper;
using TheUpperRoom.Application.Auth;

namespace TheUpperRoom.Application.Tests;

public sealed class AuthValidatorTests
{
    [Fact]
    public void Register_too_short_password_fails()
    {
        new RegisterCommandValidator()
            .TestValidate(new RegisterCommand("a@b.com", "short!", null))
            .ShouldHaveValidationErrorFor(c => c.Password);
    }

    [Fact]
    public void Register_invalid_email_fails()
    {
        new RegisterCommandValidator()
            .TestValidate(new RegisterCommand("not-an-email", "ValidPass!42x", null))
            .ShouldHaveValidationErrorFor(c => c.Email);
    }

    [Fact]
    public void Register_valid_credentials_pass()
    {
        new RegisterCommandValidator()
            .TestValidate(new RegisterCommand("a@b.com", "ValidPass!42x", "Toronto"))
            .ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void ChangePassword_new_password_too_short_fails()
    {
        new ChangePasswordCommandValidator()
            .TestValidate(new ChangePasswordCommand("u", "OldPass!42x", "short!"))
            .ShouldHaveValidationErrorFor(c => c.NewPassword);
    }

    [Fact]
    public void ChangePassword_empty_current_password_fails()
    {
        new ChangePasswordCommandValidator()
            .TestValidate(new ChangePasswordCommand("u", string.Empty, "ValidPass!42x"))
            .ShouldHaveValidationErrorFor(c => c.CurrentPassword);
    }

    [Fact]
    public void SignIn_empty_email_fails()
    {
        new SignInCommandValidator()
            .TestValidate(new SignInCommand(string.Empty, "ValidPass!42x"))
            .ShouldHaveValidationErrorFor(c => c.Email);
    }

    [Fact]
    public void SignIn_email_not_email_format_fails()
    {
        new SignInCommandValidator()
            .TestValidate(new SignInCommand("not-an-email", "ValidPass!42x"))
            .ShouldHaveValidationErrorFor(c => c.Email);
    }
}
