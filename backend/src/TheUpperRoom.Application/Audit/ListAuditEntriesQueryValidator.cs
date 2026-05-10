using FluentValidation;

namespace TheUpperRoom.Application.Audit;

public sealed class ListAuditEntriesQueryValidator : AbstractValidator<ListAuditEntriesQuery>
{
    public ListAuditEntriesQueryValidator()
    {
        RuleFor(query => query.Page)
            .GreaterThan(0)
            .WithMessage("Page must be 1 or greater.");

        RuleFor(query => query.PageSize)
            .GreaterThan(0)
            .LessThanOrEqualTo(200)
            .WithMessage("PageSize must be between 1 and 200.");
    }
}
