using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Tournaments;

public class CreateTournamentMatchRequest
{
    [Required]
    [StringLength(30)]
    public string Bracket { get; set; } = "upper";

    public int RoundSize { get; set; } = 2;

    public int RoundNumber { get; set; } = 1;

    public int MatchNumber { get; set; } = 1;

    public CreateTournamentMatchSlotRequest Slot1 { get; set; } = new();

    public CreateTournamentMatchSlotRequest Slot2 { get; set; } = new();

    public int? WinnerToMatchId { get; set; }

    public int? WinnerToSlotNumber { get; set; }

    public int? LoserToMatchId { get; set; }

    public int? LoserToSlotNumber { get; set; }

    public DateTime? ScheduledAtUtc { get; set; }

    [StringLength(500)]
    public string? StreamUrl { get; set; }

    [StringLength(1000)]
    public string? Comment { get; set; }
}

public class CreateTournamentMatchSlotRequest
{
    public int? RegistrationId { get; set; }

    public int? SourceMatchId { get; set; }

    /// <summary>
    /// winner или loser.
    /// </summary>
    [StringLength(20)]
    public string? SourceResult { get; set; }

    public int? SeedNumber { get; set; }

    public bool IsBye { get; set; }
}