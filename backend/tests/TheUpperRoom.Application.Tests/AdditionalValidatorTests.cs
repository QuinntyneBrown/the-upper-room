// Smaller "smoke" tests for validators whose rules are simple
// NotEmpty / length-bound checks. Larger validators with custom logic
// (SubmitRsvp, ListAuditEntries, CreateContact, MoveCard,
// DispatchNotification) have their own dedicated test files.
using FluentValidation.TestHelper;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Events;
using TheUpperRoom.Application.Kanban;
using TheUpperRoom.Application.Notes;
using TheUpperRoom.Application.Notifications;

namespace TheUpperRoom.Application.Tests;

public sealed class AdditionalValidatorTests
{
    [Fact]
    public void DeleteContact_empty_id_fails()
    {
        new DeleteContactCommandValidator()
            .TestValidate(new DeleteContactCommand("u", string.Empty))
            .ShouldHaveValidationErrorFor(c => c.Id);
    }

    [Fact]
    public void PatchContact_empty_id_fails()
    {
        new PatchContactCommandValidator()
            .TestValidate(new PatchContactCommand("u", string.Empty, null))
            .ShouldHaveValidationErrorFor(c => c.Id);
    }

    [Fact]
    public void SetContactArchived_empty_id_fails()
    {
        new SetContactArchivedCommandValidator()
            .TestValidate(new SetContactArchivedCommand("u", string.Empty, true))
            .ShouldHaveValidationErrorFor(c => c.Id);
    }

    [Fact]
    public void DeleteNote_empty_id_fails()
    {
        new DeleteNoteCommandValidator()
            .TestValidate(new DeleteNoteCommand("u", string.Empty))
            .ShouldHaveValidationErrorFor(c => c.Id);
    }

    [Fact]
    public void DeleteCard_empty_id_fails()
    {
        new DeleteCardCommandValidator()
            .TestValidate(new DeleteCardCommand("u", string.Empty))
            .ShouldHaveValidationErrorFor(c => c.CardId);
    }

    [Fact]
    public void PatchCard_empty_id_fails()
    {
        new PatchCardCommandValidator()
            .TestValidate(new PatchCardCommand("u", string.Empty, null))
            .ShouldHaveValidationErrorFor(c => c.CardId);
    }

    [Fact]
    public void MarkNotificationRead_empty_id_fails()
    {
        new MarkNotificationReadCommandValidator()
            .TestValidate(new MarkNotificationReadCommand("u", string.Empty))
            .ShouldHaveValidationErrorFor(c => c.Id);
    }

    [Fact]
    public void ApproveRsvp_empty_event_id_fails()
    {
        new ApproveRsvpCommandValidator()
            .TestValidate(new ApproveRsvpCommand("u", string.Empty, "rsvp-user"))
            .ShouldHaveValidationErrorFor(c => c.EventId);
    }

    [Fact]
    public void ApproveRsvp_empty_rsvp_user_id_fails()
    {
        new ApproveRsvpCommandValidator()
            .TestValidate(new ApproveRsvpCommand("u", "e1", string.Empty))
            .ShouldHaveValidationErrorFor(c => c.RsvpUserId);
    }

    [Fact]
    public void DenyRsvp_empty_event_id_fails()
    {
        new DenyRsvpCommandValidator()
            .TestValidate(new DenyRsvpCommand("u", string.Empty, "rsvp-user"))
            .ShouldHaveValidationErrorFor(c => c.EventId);
    }

    [Fact]
    public void CancelEvent_empty_event_id_fails()
    {
        new CancelEventCommandValidator()
            .TestValidate(new CancelEventCommand("u", string.Empty, null))
            .ShouldHaveValidationErrorFor(c => c.EventId);
    }

    [Fact]
    public void CancelEvent_long_message_fails()
    {
        new CancelEventCommandValidator()
            .TestValidate(new CancelEventCommand("u", "e1", new string('m', 2001)))
            .ShouldHaveValidationErrorFor(c => c.Message);
    }

    [Fact]
    public void SubscribePush_empty_endpoint_fails()
    {
        new SubscribePushCommandValidator()
            .TestValidate(new SubscribePushCommand("u", new PushSubscribeRequest(string.Empty, null)))
            .ShouldHaveValidationErrorFor(c => c.Body!.Endpoint);
    }

    [Fact]
    public void UpsertNotificationPreference_empty_code_fails()
    {
        new UpsertNotificationPreferenceCommandValidator()
            .TestValidate(new UpsertNotificationPreferenceCommand(
                "u", new UpsertPreferenceRequest(string.Empty, true, true, false)))
            .ShouldHaveValidationErrorFor(c => c.Body!.Code);
    }

    [Fact]
    public void CreateNote_empty_subject_type_fails()
    {
        new CreateNoteCommandValidator()
            .TestValidate(new CreateNoteCommand("u", new CreateNoteRequest(string.Empty, "s1", "body")))
            .ShouldHaveValidationErrorFor(c => c.Body!.SubjectType);
    }

    [Fact]
    public void CreateNote_empty_body_markdown_fails()
    {
        new CreateNoteCommandValidator()
            .TestValidate(new CreateNoteCommand("u", new CreateNoteRequest("Contact", "s1", string.Empty)))
            .ShouldHaveValidationErrorFor(c => c.Body!.BodyMarkdown);
    }

    [Fact]
    public void UpdateNote_empty_id_fails()
    {
        new UpdateNoteCommandValidator()
            .TestValidate(new UpdateNoteCommand("u", string.Empty, new UpdateNoteRequest("body")))
            .ShouldHaveValidationErrorFor(c => c.Id);
    }
}
