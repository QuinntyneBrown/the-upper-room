// traces_to: PHASE-2.6
using FluentValidation.TestHelper;
using TheUpperRoom.Application.Events;

namespace TheUpperRoom.Application.Tests;

public sealed class SubmitRsvpCommandValidatorTests
{
    private readonly SubmitRsvpCommandValidator _validator = new();

    [Theory]
    [InlineData("Going")]
    [InlineData("Maybe")]
    [InlineData("No")]
    public void Allows_supported_statuses(string status)
    {
        var result = _validator.TestValidate(new SubmitRsvpCommand("u", "e1", new RsvpRequest(status)));

        result.ShouldNotHaveValidationErrorFor(c => c.Body!.Status);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Yes")]
    [InlineData("PendingApproval")]
    [InlineData("Waitlisted")]
    [InlineData("Cancelled")]
    public void Rejects_unsupported_statuses(string status)
    {
        var result = _validator.TestValidate(new SubmitRsvpCommand("u", "e1", new RsvpRequest(status)));

        result.ShouldHaveValidationErrorFor(c => c.Body!.Status);
    }

    [Fact]
    public void Empty_event_id_fails()
    {
        var result = _validator.TestValidate(new SubmitRsvpCommand("u", string.Empty, new RsvpRequest("Going")));

        result.ShouldHaveValidationErrorFor(c => c.EventId);
    }

    [Fact]
    public void Null_body_skips_status_check()
    {
        // Null body is handled by the handler (returns BadRequest); the
        // validator only runs the When-guarded rules.
        var result = _validator.TestValidate(new SubmitRsvpCommand("u", "e1", null));

        result.ShouldNotHaveValidationErrorFor(c => c.Body);
    }
}
