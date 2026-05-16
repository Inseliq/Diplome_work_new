namespace CosmoManager.Responses;

public sealed record AuthUserResponse(
    string Id,
    string Nickname,
    string Email,
    IReadOnlyCollection<string> Roles,
    ClanShortResponse? Clan,
    string? ClanRank,
    string? ClanRankLabel
);