namespace TheUpperRoom.Api.Contacts;

public enum ContactsOutcome
{
    Ok,
    Created,
    NoContent,
    Unauthorized,
    Forbidden,
    NotFound,
    BadRequest,
    Unprocessable,
}
