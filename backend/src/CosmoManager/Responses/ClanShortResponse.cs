namespace CosmoManager.Responses;

public sealed record ClanShortResponse(
    int Id,
    string Tag,
    string Name
);