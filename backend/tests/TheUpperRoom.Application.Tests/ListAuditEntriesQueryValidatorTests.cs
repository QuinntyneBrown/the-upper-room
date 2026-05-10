using FluentValidation.TestHelper;
using TheUpperRoom.Application.Audit;

namespace TheUpperRoom.Application.Tests;

public sealed class ListAuditEntriesQueryValidatorTests
{
    private readonly ListAuditEntriesQueryValidator _validator = new();

    private static ListAuditEntriesQuery Q(int page, int pageSize) =>
        new("u", null, null, null, null, null, page, pageSize);

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Page_must_be_at_least_one(int page)
    {
        _validator.TestValidate(Q(page, 20)).ShouldHaveValidationErrorFor(q => q.Page);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(50)]
    public void Page_at_or_above_one_passes(int page)
    {
        _validator.TestValidate(Q(page, 20)).ShouldNotHaveValidationErrorFor(q => q.Page);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(201)]
    [InlineData(1000)]
    public void PageSize_outside_one_to_two_hundred_fails(int size)
    {
        _validator.TestValidate(Q(1, size)).ShouldHaveValidationErrorFor(q => q.PageSize);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(20)]
    [InlineData(200)]
    public void PageSize_one_to_two_hundred_inclusive_passes(int size)
    {
        _validator.TestValidate(Q(1, size)).ShouldNotHaveValidationErrorFor(q => q.PageSize);
    }
}
