using TheUpperRoom.Application.Audit;
using TheUpperRoom.Application.Auth;
using TheUpperRoom.Application.Contacts;
using TheUpperRoom.Application.Dashboard;
using TheUpperRoom.Application.Events;
using TheUpperRoom.Application.Kanban;
using TheUpperRoom.Application.Notifications;
using TheUpperRoom.Application.Notes;
using TheUpperRoom.Application.Uploads;

namespace TheUpperRoom.Application.Tests;

// Wire-shape records the SPA reads. Their property *order* is part of
// the contract because Microsoft.AspNetCore.Mvc's System.Text.Json
// serialiser emits camelCased property names matching declaration order.
// Renaming a record field would break the JSON shape for clients --
// pinning the constructor positional order surfaces such regressions.
public sealed class WireShapeRecordTests
{
    [Fact]
    public void NotificationPreferenceDto_positional_order_pinned()
    {
        var dto = new NotificationPreferenceDto("welcome", true, false, true);
        Assert.Equal("welcome", dto.Code);
        Assert.True(dto.InApp);
        Assert.False(dto.Email);
        Assert.True(dto.Push);
    }

    [Fact]
    public void NotificationPreferenceDto_records_with_same_fields_are_equal()
    {
        var a = new NotificationPreferenceDto("welcome", true, true, false);
        var b = new NotificationPreferenceDto("welcome", true, true, false);
        Assert.Equal(a, b);
        Assert.Equal(a.GetHashCode(), b.GetHashCode());
    }

    [Fact]
    public void AttendeeDto_positional_order_pinned()
    {
        var dto = new AttendeeDto("a-1", "Ada Lovelace", "https://example.com/a.png", "Going");
        Assert.Equal("a-1", dto.Id);
        Assert.Equal("Ada Lovelace", dto.Name);
        Assert.Equal("https://example.com/a.png", dto.AvatarUrl);
        Assert.Equal("Going", dto.RsvpStatus);
    }

    [Fact]
    public void PendingRsvpDto_positional_order_pinned()
    {
        var dto = new PendingRsvpDto("p-1", "u-1", "Ada Lovelace", "2026-05-10T12:00:00Z");
        Assert.Equal("p-1", dto.Id);
        Assert.Equal("u-1", dto.UserId);
        Assert.Equal("Ada Lovelace", dto.UserName);
        Assert.Equal("2026-05-10T12:00:00Z", dto.RequestedAt);
    }

    [Fact]
    public void Contact_record_implements_IHasCity_with_positional_order()
    {
        var c = new Contact("c-1", "Ada Lovelace", "city-1");
        Assert.Equal("c-1", c.Id);
        Assert.Equal("Ada Lovelace", c.Name);
        Assert.Equal("city-1", c.CityId);

        // IHasCity contract: city-scoped queries narrow by CityId.
        TheUpperRoom.Domain.Cities.IHasCity asCity = c;
        Assert.Equal("city-1", asCity.CityId);
    }

    [Fact]
    public void NotificationDto_positional_order_pinned()
    {
        var t = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);
        var dto = new NotificationDto(
            "n-1", "welcome", "Welcome", "Hi there",
            new Dictionary<string, string> { ["k"] = "v" },
            Read: false,
            CreatedAt: t,
            DeepLink: "/home",
            Severity: "Info");

        Assert.Equal("n-1", dto.Id);
        Assert.Equal("welcome", dto.Code);
        Assert.Equal("Welcome", dto.Title);
        Assert.Equal("Hi there", dto.Body);
        Assert.False(dto.Read);
        Assert.Equal(t, dto.CreatedAt);
        Assert.Equal("/home", dto.DeepLink);
        Assert.Equal("Info", dto.Severity);
    }

    [Fact]
    public void DashboardStats_record_value_equality_and_field_order()
    {
        var a = new DashboardStats(Contacts: 12, Partners: 3, UpcomingEvents: 5, OpenIdeas: 2);
        var b = new DashboardStats(12, 3, 5, 2);
        Assert.Equal(a, b);
        Assert.Equal(12, a.Contacts);
        Assert.Equal(3, a.Partners);
        Assert.Equal(5, a.UpcomingEvents);
        Assert.Equal(2, a.OpenIdeas);
    }

    [Fact]
    public void NoteVersionDto_positional_order_pinned()
    {
        var t = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);
        var dto = new NoteVersionDto("v-1", "raw", "<p>raw</p>", t, "creator");
        Assert.Equal("v-1", dto.Id);
        Assert.Equal("raw", dto.BodyMarkdown);
        Assert.Equal("<p>raw</p>", dto.BodyHtmlSanitized);
        Assert.Equal(t, dto.CreatedAt);
        Assert.Equal("creator", dto.CreatedBy);
    }

    [Fact]
    public void RegisterResult_optional_token_and_user_id_default_to_null()
    {
        var conflict = new RegisterResult(AuthMutationOutcome.Conflict);
        Assert.Equal(AuthMutationOutcome.Conflict, conflict.Outcome);
        Assert.Null(conflict.UserId);
        Assert.Null(conflict.EmailVerificationToken);

        var created = new RegisterResult(AuthMutationOutcome.Created, "u-1", "tok");
        Assert.Equal("u-1", created.UserId);
        Assert.Equal("tok", created.EmailVerificationToken);
    }

    [Fact]
    public void SignInResult_optional_user_id_defaults_to_null()
    {
        var failure = new SignInResult(SignInOutcome.InvalidCredentials);
        Assert.Null(failure.UserId);

        var success = new SignInResult(SignInOutcome.Success, "u-1");
        Assert.Equal("u-1", success.UserId);
    }

    [Fact]
    public void AuthUser_record_positional_order_with_nullable_password()
    {
        var external = new AuthUser("u-1", "ada@example.com", PasswordHash: null, EmailVerified: false);
        Assert.Null(external.PasswordHash);
        Assert.False(external.EmailVerified);

        var local = new AuthUser("u-2", "bob@example.com", "hash::pw", true);
        Assert.Equal("hash::pw", local.PasswordHash);
        Assert.True(local.EmailVerified);
    }

    [Fact]
    public void RequestPasswordResetResult_default_token_is_null()
    {
        // Used to hide email-existence: handler returns the default
        // (no token) when the store declines to issue one.
        var blank = new RequestPasswordResetResult();
        Assert.Null(blank.ResetToken);

        var issued = new RequestPasswordResetResult("plain-token");
        Assert.Equal("plain-token", issued.ResetToken);
    }

    [Fact]
    public void PushKeys_record_value_equality()
    {
        var a = new PushKeys("p256-x", "auth-y");
        var b = new PushKeys("p256-x", "auth-y");
        Assert.Equal(a, b);
        Assert.NotEqual(a, new PushKeys("p256-x", "different-auth"));
    }

    [Fact]
    public void PushSubscribeRequest_keys_can_be_null()
    {
        var partial = new PushSubscribeRequest("https://push.example.com/sub", Keys: null);
        Assert.Null(partial.Keys);

        var full = new PushSubscribeRequest("https://push.example.com/sub", new PushKeys("p", "a"));
        Assert.NotNull(full.Keys);
    }

    [Fact]
    public void RsvpResponse_optional_waitlist_and_promoted_user_default_to_null()
    {
        var simple = new RsvpResponse("Going");
        Assert.Null(simple.WaitlistPosition);
        Assert.Null(simple.PromotedUser);

        var waitlisted = new RsvpResponse("Waitlisted", WaitlistPosition: 3);
        Assert.Equal(3, waitlisted.WaitlistPosition);

        var cancelled = new RsvpResponse("Cancelled", null, PromotedUser: "u-2");
        Assert.Equal("u-2", cancelled.PromotedUser);
    }

    [Fact]
    public void CreateContactRequest_optional_fields_can_all_be_null()
    {
        var minimal = new CreateContactRequest("Ada", null, null, null, null, null);
        Assert.Equal("Ada", minimal.FirstName);
        Assert.Null(minimal.LastName);
        Assert.Null(minimal.Pronouns);
        Assert.Null(minimal.Title);
        Assert.Null(minimal.Org);
        Assert.Null(minimal.DisplayName);
    }

    [Fact]
    public void NoteResult_records_with_same_fields_are_equal()
    {
        var a = new NoteResult(null, NotesOutcome.NotFound, null);
        var b = new NoteResult(null, NotesOutcome.NotFound, null);
        Assert.Equal(a, b);
    }

    [Fact]
    public void MutateContactResult_records_carry_optional_payload_outcome_error()
    {
        var success = new MutateContactResult(
            new Contact("c-1", "Ada", "city-1"), ContactsOutcome.Created, null);
        Assert.NotNull(success.Contact);
        Assert.Equal(ContactsOutcome.Created, success.Outcome);
        Assert.Null(success.Error);

        var failed = new MutateContactResult(null, ContactsOutcome.Unprocessable, "reason");
        Assert.Null(failed.Contact);
        Assert.Equal("reason", failed.Error);
    }

    [Fact]
    public void Note_request_records_carry_only_minimal_data()
    {
        var create = new CreateNoteRequest("Contact", "c-1", "body");
        Assert.Equal("Contact", create.SubjectType);
        Assert.Equal("c-1", create.SubjectId);
        Assert.Equal("body", create.BodyMarkdown);

        var update = new UpdateNoteRequest("new body");
        Assert.Equal("new body", update.BodyMarkdown);

        // Update is intentionally narrower than Create -- subject type
        // and id are immutable after creation.
        Assert.Single(typeof(UpdateNoteRequest).GetProperties());
    }

    [Fact]
    public void PatchContactRequest_name_is_nullable_for_partial_updates()
    {
        // Patch semantics: a missing field means "don't change".
        var nameOnly = new PatchContactRequest("New Name");
        Assert.Equal("New Name", nameOnly.Name);

        var noFields = new PatchContactRequest(null);
        Assert.Null(noFields.Name);
    }

    [Fact]
    public void Auth_outcome_only_results_carry_no_payload()
    {
        // ChangePassword/DeleteAccount/Reset/VerifyEmail all return just
        // the outcome -- no payload, no error string. Confirming the
        // 1-property record shape so a future addition is deliberate.
        Assert.Single(typeof(ChangePasswordResult).GetProperties());
        Assert.Single(typeof(DeleteAccountResult).GetProperties());
        Assert.Single(typeof(ResetPasswordResult).GetProperties());
        Assert.Single(typeof(VerifyEmailResult).GetProperties());
    }

    [Fact]
    public void ListAuditEntriesResult_carries_pagination_surface()
    {
        var result = new ListAuditEntriesResult(
            Items: Array.Empty<AuditEntryDto>(),
            Total: 0,
            Page: 1,
            PageSize: 50,
            Outcome: ListAuditEntriesOutcome.Ok);

        Assert.Empty(result.Items);
        Assert.Equal(0, result.Total);
        Assert.Equal(1, result.Page);
        Assert.Equal(50, result.PageSize);
        Assert.Equal(ListAuditEntriesOutcome.Ok, result.Outcome);
    }

    [Fact]
    public void MarkNotificationReadResult_carries_optional_notification_dto()
    {
        var t = new DateTimeOffset(2026, 5, 10, 12, 0, 0, TimeSpan.Zero);
        var dto = new NotificationDto(
            "n-1", "welcome", "Welcome", "Body", new(), false, t, null, "Info");

        var success = new MarkNotificationReadResult(dto, NotificationsOutcome.Ok);
        Assert.NotNull(success.Notification);
        Assert.Equal(NotificationsOutcome.Ok, success.Outcome);

        var failure = new MarkNotificationReadResult(null, NotificationsOutcome.NotFound);
        Assert.Null(failure.Notification);
    }

    [Fact]
    public void SubmitRsvpResult_response_is_null_on_validation_or_auth_failure()
    {
        // Auth handlers consistently use a (Payload?, Outcome) shape so
        // controllers can render a 4xx with no body or a 200 with one
        // by branching on Outcome.
        var unauthorized = new SubmitRsvpResult(null, RsvpOutcome.Unauthorized);
        Assert.Null(unauthorized.Response);

        var ok = new SubmitRsvpResult(new RsvpResponse("Going"), RsvpOutcome.Ok);
        Assert.NotNull(ok.Response);
    }

    [Fact]
    public void Kanban_card_results_share_payload_or_outcome_shape()
    {
        var move = new MoveCardResult(new { id = "c-1" }, KanbanOutcome.Ok);
        Assert.NotNull(move.Payload);
        Assert.Equal(KanbanOutcome.Ok, move.Outcome);

        var patch = new PatchCardResult(null, KanbanOutcome.NotFound);
        Assert.Null(patch.Payload);

        // DeleteCardResult is outcome-only (the controller maps Ok -> 204).
        Assert.Single(typeof(DeleteCardResult).GetProperties());
    }

    [Fact]
    public void CancelEventResult_event_is_null_when_outcome_not_cancelled()
    {
        var notFound = new CancelEventResult(null, CancelEventOutcome.NotFound);
        Assert.Null(notFound.Event);
        Assert.Equal(CancelEventOutcome.NotFound, notFound.Outcome);
    }

    [Fact]
    public void GetMyRsvpResult_optional_status_and_waitlist_position()
    {
        var unanswered = new GetMyRsvpResult(null, null, RsvpOutcome.Ok);
        Assert.Null(unanswered.Status);
        Assert.Null(unanswered.WaitlistPosition);

        var waitlisted = new GetMyRsvpResult("Waitlisted", 5, RsvpOutcome.Ok);
        Assert.Equal("Waitlisted", waitlisted.Status);
        Assert.Equal(5, waitlisted.WaitlistPosition);
    }

    [Fact]
    public void UploadFileResult_url_and_error_are_mutually_exclusive_in_practice()
    {
        var ok = new UploadFileResult("https://cdn.example.com/x.png", UploadFileOutcome.Uploaded, null);
        Assert.NotNull(ok.Url);
        Assert.Null(ok.Error);

        var rejected = new UploadFileResult(null, UploadFileOutcome.TooLarge, "10MB max");
        Assert.Null(rejected.Url);
        Assert.NotNull(rejected.Error);
    }

    [Fact]
    public void EventDto_optional_arguments_default_to_null_or_false()
    {
        var dto = new EventDto(
            "e-1",
            "Title",
            CoverImageUrl: null,
            Status: "Scheduled",
            StartAt: DateTimeOffset.UnixEpoch,
            EndAt: DateTimeOffset.UnixEpoch.AddHours(2),
            Location: null,
            IsVirtual: false,
            RsvpCount: 0,
            Capacity: null,
            Tags: []);

        Assert.Null(dto.Description);
        Assert.Null(dto.Attendees);
        Assert.False(dto.RequiresApproval);
        Assert.Null(dto.RecurrenceRule);
        Assert.Null(dto.RecurrenceId);
        Assert.Null(dto.OccurrenceDate);
        Assert.Null(dto.ExceptionDates);
        Assert.Null(dto.Timezone);
    }
}
