namespace CosmoManager.Responses.Tournaments;

public class TournamentRegistrationOptionResponse
{
    public int RegistrationId { get; set; }

    public int TournamentId { get; set; }

    public string TeamName { get; set; } = null!;

    public string CaptainNickname { get; set; } = null!;

    public string? Contact { get; set; }

    public DateTime RegisteredAtUtc { get; set; }
}