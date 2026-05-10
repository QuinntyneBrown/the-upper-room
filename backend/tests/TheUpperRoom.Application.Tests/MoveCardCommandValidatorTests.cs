using FluentValidation.TestHelper;
using TheUpperRoom.Application.Kanban;

namespace TheUpperRoom.Application.Tests;

public sealed class MoveCardCommandValidatorTests
{
    private readonly MoveCardCommandValidator _validator = new();

    [Fact]
    public void Empty_card_id_fails()
    {
        _validator.TestValidate(new MoveCardCommand("u", string.Empty, "col-1"))
            .ShouldHaveValidationErrorFor(c => c.CardId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void Empty_or_null_target_column_fails(string? target)
    {
        _validator.TestValidate(new MoveCardCommand("u", "card-1", target!))
            .ShouldHaveValidationErrorFor(c => c.TargetColumnId);
    }

    [Fact]
    public void Valid_command_passes()
    {
        _validator.TestValidate(new MoveCardCommand("u", "card-1", "col-2"))
            .ShouldNotHaveAnyValidationErrors();
    }
}
