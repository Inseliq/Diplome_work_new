namespace CosmoManager.Responses;

public sealed record ClanUserResponse(
    string Id,
    string Nickname,
    string? Email,
    string Rank,
    string RankLabel,
    IReadOnlyCollection<string> Roles
);