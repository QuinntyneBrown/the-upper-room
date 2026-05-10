using FluentValidation.TestHelper;
using TheUpperRoom.Application.Notifications;

namespace TheUpperRoom.Application.Tests;

public sealed class DispatchNotificationCommandValidatorTests
{
    private readonly DispatchNotificationCommandValidator _validator = new();

    [Fact]
    public void Empty_code_fails()
    {
        var cmd = new DispatchNotificationCommand("u", new DispatchRequest("", new[] { "r1" }, null));
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(c => c.Body!.Code);
    }

    [Fact]
    public void Empty_recipient_list_fails()
    {
        var cmd = new DispatchNotificationCommand("u", new DispatchRequest("Code1", Array.Empty<string>(), null));
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(c => c.Body!.RecipientIds);
    }

    [Fact]
    public void Valid_body_passes()
    {
        var cmd = new DispatchNotificationCommand("u", new DispatchRequest("Code1", new[] { "r1", "r2" }, null));
        _validator.TestValidate(cmd).ShouldNotHaveAnyValidationErrors();
    }
}
