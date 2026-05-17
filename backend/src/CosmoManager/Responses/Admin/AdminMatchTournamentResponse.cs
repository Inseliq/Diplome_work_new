namespace CosmoManager.Responses.Admin;

public class AdminMatchTournamentResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string Format { get; set; } = string.Empty;

    public int TeamSize { get; set; }

    public int ReserveSize { get; set; }

    public int? MaxParticipants { get; set; }

    public int CurrentParticipants { get; set; }

    public int RegistrationsCount { get; set; }

    public int MatchesCount { get; set; }

    public bool HasMatches { get; set; }

    public bool IsPublished { get; set; }
}