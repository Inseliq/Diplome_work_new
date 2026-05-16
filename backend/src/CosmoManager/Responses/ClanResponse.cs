namespace CosmoManager.Responses;

public sealed record ClanResponse(
    int Id,
    string Tag,
    string Name,
    string Description,
    int EloRating,
    int MembersCount,
    DateTime CreatedAtUtc
);