namespace CosmoManager.Responses;

public sealed record ClanReserveStateResponse(
    bool CanActivateReserves,
    DateTime ServerTimeUtc,
    IReadOnlyCollection<ClanReserveGroupResponse> Groups
);

public sealed record ClanReserveGroupResponse(
    string Key,
    string Title,
    ClanActiveReserveResponse? ActiveReserve,
    IReadOnlyCollection<ClanReserveItemResponse> Reserves
);

public sealed record ClanReserveItemResponse(
    string Type,
    string Group,
    string Title,
    string Description,
    string BonusText,
    string ImageUrl,
    int Stock,
    bool IsActive,
    bool CanActivate,
    string StatusText,
    DateTime? EndsAtUtc
);

public sealed record ClanActiveReserveResponse(
    string Type,
    string Title,
    DateTime ActivatedAtUtc,
    DateTime EndsAtUtc,
    string ActivatedByNickname
);