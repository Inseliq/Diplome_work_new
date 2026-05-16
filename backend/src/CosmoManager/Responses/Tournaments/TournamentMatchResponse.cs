namespace CosmoManager.Responses.Tournaments;

public class TournamentMatchResponse
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public string Bracket { get; set; } = null!;

    public int RoundSize { get; set; }

    public string RoundTitle { get; set; } = null!;

    public int RoundNumber { get; set; }

    public int MatchNumber { get; set; }

    public string Status { get; set; } = null!;

    public string ResultStatus { get; set; } = null!;

    public int Team1Score { get; set; }

    public int Team2Score { get; set; }

    public int? WinnerRegistrationId { get; set; }

    public int? AdvancingRegistrationId { get; set; }

    public int? WinnerToMatchId { get; set; }

    public int? WinnerToSlotNumber { get; set; }

    public int? LoserToMatchId { get; set; }

    public int? LoserToSlotNumber { get; set; }

    public string? ScheduledAt { get; set; }

    public string? ScheduledAtISO { get; set; }

    public string? StartedAtISO { get; set; }

    public string? FinishedAtISO { get; set; }

    public string? StreamUrl { get; set; }

    public string? Comment { get; set; }

    public List<TournamentMatchSlotResponse> Slots { get; set; } = [];
}

public class TournamentMatchSlotResponse
{
    public int Id { get; set; }

    public int SlotNumber { get; set; }

    public int? RegistrationId { get; set; }

    public string? TeamName { get; set; }

    public string? CaptainNickname { get; set; }

    public int? SourceMatchId { get; set; }

    public string? SourceResult { get; set; }

    public int? SeedNumber { get; set; }

    public bool IsBye { get; set; }

    public bool IsWinner { get; set; }

    public bool IsAdvancing { get; set; }
}