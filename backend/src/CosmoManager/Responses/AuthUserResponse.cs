namespace CosmoManager.Responses;

public sealed record AuthUserResponse(
    string Id,
    string Nickname,
    string Email,
    IReadOnlyCollection<string> Roles
);