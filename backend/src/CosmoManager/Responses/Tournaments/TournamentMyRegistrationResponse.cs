namespace CosmoManager.Responses.Tournaments;

public class TournamentMyRegistrationResponse
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public string TeamName { get; set; } = string.Empty;

    public string? Contact { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; } = string.Empty;

    public string StatusLabel { get; set; } = string.Empty;

    public DateTime RegisteredAtUtc { get; set; }

    public string RegisteredAt { get; set; } = string.Empty;

    public IReadOnlyCollection<TournamentRegistrationPlayerResponse> Players { get; set; } = [];
}

public class TournamentRegistrationPlayerResponse
{
    public int Id { get; set; }

    public string Nickname { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string RoleLabel { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}