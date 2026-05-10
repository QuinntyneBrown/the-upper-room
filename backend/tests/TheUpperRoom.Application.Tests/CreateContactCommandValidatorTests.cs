using FluentValidation.TestHelper;
using TheUpperRoom.Application.Contacts;

namespace TheUpperRoom.Application.Tests;

public sealed class CreateContactCommandValidatorTests
{
    private readonly CreateContactCommandValidator _validator = new();

    [Fact]
    public void Empty_first_name_fails()
    {
        var cmd = new CreateContactCommand("u", new CreateContactRequest("", null, null, null, null, null));
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(c => c.Body!.FirstName);
    }

    [Fact]
    public void First_name_over_one_hundred_chars_fails()
    {
        var cmd = new CreateContactCommand("u", new CreateContactRequest(new string('a', 101), null, null, null, null, null));
        _validator.TestValidate(cmd).ShouldHaveValidationErrorFor(c => c.Body!.FirstName);
    }

    [Fact]
    public void Valid_body_passes()
    {
        var cmd = new CreateContactCommand("u", new CreateContactRequest("Alice", "Jones", null, null, null, null));
        _validator.TestValidate(cmd).ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Null_body_passes_validator()
    {
        // The handler returns BadRequest for null Body; the validator skips
        // its When-guarded rules so the handler can run.
        var cmd = new CreateContactCommand("u", null);
        _validator.TestValidate(cmd).ShouldNotHaveAnyValidationErrors();
    }
}
