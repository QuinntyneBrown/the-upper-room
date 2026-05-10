using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Kanban;
using TheUpperRoom.Domain.Tags;

namespace TheUpperRoom.Domain.Tests;

public sealed class KanbanBoardTests
{
    private static readonly DateTimeOffset Utc =
        new(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);

    private static KanbanBoard NewBoard() =>
        new("city-1", "Outreach", null, "creator", Utc);

    private static IReadOnlyDictionary<string, string?> EmptyData() =>
        new Dictionary<string, string?>();

    [Fact]
    public void Add_column_assigns_sequential_order_and_returns_column()
    {
        var board = NewBoard();

        var c0 = board.AddColumn("Backlog", TagColor.Blue, null, "u", Utc);
        var c1 = board.AddColumn("Doing", TagColor.Green, null, "u", Utc);
        var c2 = board.AddColumn("Done", TagColor.Teal, null, "u", Utc);

        Assert.Equal(0, c0.Order);
        Assert.Equal(1, c1.Order);
        Assert.Equal(2, c2.Order);
        Assert.Equal(3, board.Columns.Count);
    }

    [Fact]
    public void Reorder_columns_rejects_set_that_is_not_a_permutation()
    {
        var board = NewBoard();
        var c0 = board.AddColumn("A", TagColor.Blue, null, "u", Utc);
        board.AddColumn("B", TagColor.Green, null, "u", Utc);

        Assert.Throws<DomainException>(() =>
            board.ReorderColumns([c0.Id], "u", Utc.AddSeconds(1)));
        Assert.Throws<DomainException>(() =>
            board.ReorderColumns([c0.Id, c0.Id], "u", Utc.AddSeconds(1)));
    }

    [Fact]
    public void Reorder_columns_applies_new_order_when_valid()
    {
        var board = NewBoard();
        var a = board.AddColumn("A", TagColor.Blue, null, "u", Utc);
        var b = board.AddColumn("B", TagColor.Green, null, "u", Utc);

        board.ReorderColumns([b.Id, a.Id], "u", Utc.AddSeconds(1));

        Assert.Equal([b.Id, a.Id], board.Columns.Select(c => c.Id));
    }

    [Fact]
    public void Replace_schema_rejects_duplicate_keys()
    {
        var board = NewBoard();

        Assert.Throws<DomainException>(() => board.ReplaceSchema(
            [
                new CardSchemaField("priority", KanbanFieldType.Text, "Priority", false),
                new CardSchemaField("PRIORITY", KanbanFieldType.Text, "Other", false)
            ],
            "u", Utc.AddSeconds(1)));
    }

    [Fact]
    public void Add_card_enforces_required_schema_fields()
    {
        var board = NewBoard();
        var col = board.AddColumn("Backlog", TagColor.Blue, null, "u", Utc);
        board.ReplaceSchema(
            [new CardSchemaField("owner", KanbanFieldType.Text, "Owner", required: true)],
            "u", Utc.AddSeconds(1));

        Assert.Throws<DomainException>(() => board.AddCard(
            col.Id, null, 1m, EmptyData(), null, [], "u", Utc.AddSeconds(2)));
    }

    [Fact]
    public void Add_card_to_unknown_column_throws()
    {
        var board = NewBoard();

        Assert.Throws<DomainException>(() => board.AddCard(
            "missing-column", null, 1m, EmptyData(), null, [], "u", Utc.AddSeconds(1)));
    }

    [Fact]
    public void Add_card_enforces_column_wip_limit()
    {
        var board = NewBoard();
        var col = board.AddColumn("Backlog", TagColor.Blue, wipLimit: 1, "u", Utc);
        board.AddCard(col.Id, null, 1m, EmptyData(), null, [], "u", Utc.AddSeconds(1));

        Assert.Throws<DomainException>(() => board.AddCard(
            col.Id, null, 2m, EmptyData(), null, [], "u", Utc.AddSeconds(2)));
    }

    [Fact]
    public void Move_card_enforces_wip_on_target_column_excluding_the_moving_card()
    {
        var board = NewBoard();
        var src = board.AddColumn("Src", TagColor.Blue, null, "u", Utc);
        var dst = board.AddColumn("Dst", TagColor.Green, wipLimit: 1, "u", Utc);
        var card = board.AddCard(src.Id, null, 1m, EmptyData(), null, [], "u", Utc.AddSeconds(1));
        // Filling dst with one other card
        board.AddCard(dst.Id, null, 1m, EmptyData(), null, [], "u", Utc.AddSeconds(2));

        Assert.Throws<DomainException>(() =>
            board.MoveCard(card.Id, dst.Id, null, 2m, "u", Utc.AddSeconds(3)));
    }

    [Fact]
    public void Move_card_to_unknown_card_throws()
    {
        var board = NewBoard();
        var col = board.AddColumn("A", TagColor.Blue, null, "u", Utc);

        Assert.Throws<DomainException>(() =>
            board.MoveCard("missing-card", col.Id, null, 1m, "u", Utc.AddSeconds(1)));
    }

    [Fact]
    public void Update_basics_rejects_wip_limit_below_1()
    {
        var board = NewBoard();
        Assert.Throws<DomainException>(() =>
            board.UpdateBasics("Outreach", null, 0, "u", Utc.AddSeconds(1)));
    }
}
