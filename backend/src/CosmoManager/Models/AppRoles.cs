namespace CosmoManager.Models;

public static class AppRoles
{
    public const string Moderator = "Модератор";
    public const string Administrator = "Администратор";

    public static readonly string[] All =
    [
        Moderator,
        Administrator
    ];
}