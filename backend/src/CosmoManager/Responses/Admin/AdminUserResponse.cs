using CosmoManager.Responses;

namespace CosmoManager.Responses.Admin;

public class AdminUserResponse
{
    public string Id { get; set; } = string.Empty;

    public string Nickname { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public ClanShortResponse? Clan { get; set; }

    public string? ClanRank { get; set; }

    public string? ClanRankLabel { get; set; }

    public IReadOnlyCollection<string> Roles { get; set; } = [];

    public bool IsAdministrator { get; set; }

    public bool IsModerator { get; set; }
}