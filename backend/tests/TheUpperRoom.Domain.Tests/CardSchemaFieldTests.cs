using TheUpperRoom.Domain.Common;
using TheUpperRoom.Domain.Kanban;

namespace TheUpperRoom.Domain.Tests;

public sealed class CardSchemaFieldTests
{
    [Fact]
    public void Constructor_assigns_all_fields_and_defaults_options_to_empty()
    {
        var field = new CardSchemaField("priority", KanbanFieldType.Text, "Priority", required: true);

        Assert.Equal("priority", field.Key);
        Assert.Equal(KanbanFieldType.Text, field.Type);
        Assert.Equal("Priority", field.Label);
        Assert.True(field.Required);
        Assert.Empty(field.Options);
    }

    [Fact]
    public void Constructor_keeps_options_in_provided_order()
    {
        var field = new CardSchemaField(
            "stage", KanbanFieldType.Select, "Stage", false,
            options: ["High", "Medium", "Low"]);

        Assert.Equal(["High", "Medium", "Low"], field.Options);
    }

    [Fact]
    public void Constructor_rejects_blank_key()
    {
        Assert.Throws<DomainException>(() =>
            new CardSchemaField("", KanbanFieldType.Text, "Label", false));
    }

    [Fact]
    public void Constructor_rejects_blank_label()
    {
        Assert.Throws<DomainException>(() =>
            new CardSchemaField("key", KanbanFieldType.Text, "", false));
    }

    [Fact]
    public void Constructor_rejects_blank_option_value()
    {
        Assert.Throws<DomainException>(() =>
            new CardSchemaField("k", KanbanFieldType.Select, "Lbl", false,
                options: ["A", "", "B"]));
    }

    [Fact]
    public void Constructor_rejects_key_over_50_chars()
    {
        Assert.Throws<DomainException>(() =>
            new CardSchemaField(new string('a', 51), KanbanFieldType.Text, "Label", false));
    }

    [Fact]
    public void Required_flag_is_preserved_independently_of_other_fields()
    {
        var optional = new CardSchemaField("k", KanbanFieldType.Text, "L", required: false);
        var required = new CardSchemaField("k", KanbanFieldType.Text, "L", required: true);

        Assert.False(optional.Required);
        Assert.True(required.Required);
    }

    [Fact]
    public void Null_options_argument_yields_empty_collection()
    {
        var field = new CardSchemaField("k", KanbanFieldType.Text, "Label", false,
            options: null);
        Assert.Empty(field.Options);
    }
}
