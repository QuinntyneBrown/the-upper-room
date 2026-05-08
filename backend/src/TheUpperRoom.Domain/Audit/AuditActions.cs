namespace TheUpperRoom.Domain.Audit;

public static class AuditActions
{
    public const string Create = "Create";
    public const string Update = "Update";
    public const string Delete = "Delete";
    public const string Archive = "Archive";
    public const string Restore = "Restore";
    public const string Login = "Login";
    public const string Logout = "Logout";
    public const string PermissionDenied = "PermissionDenied";
    public const string Move = "Move";
}
