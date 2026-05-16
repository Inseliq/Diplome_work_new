namespace CosmoManager.Responses.Profile;

public class ProfileResponse
{
    public string Id { get; set; } = string.Empty;

    public string Nickname { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public ProfileClanResponse? Clan { get; set; }

    public string? ClanRank { get; set; }

    public string? ClanRankLabel { get; set; }

    public IReadOnlyCollection<string> Roles { get; set; } = [];

    public IReadOnlyCollection<ProfileTournamentResponse> Tournaments { get; set; } = [];
}

public class ProfileClanResponse
{
    public int Id { get; set; }

    public string Tag { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;
}

public class ProfileTournamentResponse
{
    public int RegistrationId { get; set; }

    public int TournamentId { get; set; }

    public string TournamentName { get; set; } = string.Empty;

    public string TournamentStatus { get; set; } = string.Empty;

    public string TeamName { get; set; } = string.Empty;

    public string Format { get; set; } = string.Empty;

    public int Tier { get; set; }

    public DateTime RegisteredAtUtc { get; set; }

    public string RegisteredAt { get; set; } = string.Empty;
}