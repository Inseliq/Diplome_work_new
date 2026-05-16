namespace CosmoManager.Responses;

public sealed record ClanDetailsResponse(
    int Id,
    string Tag,
    string Name,
    string Description,
    int EloRating,
    int MembersCount,
    DateTime CreatedAtUtc,
    IReadOnlyCollection<ClanUserResponse> Players
);