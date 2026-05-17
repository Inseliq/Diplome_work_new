using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminTournamentMatchRequest
{
    [Required]
    [StringLength(30)]
    public string Bracket { get; set; } = "upper";

    [Range(2, 128)]
    public int RoundSize { get; set; } = 2;

    [Range(1, 1000)]
    public int RoundNumber { get; set; } = 1;

    [Range(1, 1000)]
    public int MatchNumber { get; set; } = 1;

    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "scheduled";

    public AdminTournamentMatchSlotRequest Slot1 { get; set; } = new();

    public AdminTournamentMatchSlotRequest Slot2 { get; set; } = new();

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

public class AdminTournamentMatchSlotRequest
{
    public int? RegistrationId { get; set; }

    public int? SourceMatchId { get; set; }

    [StringLength(20)]
    public string? SourceResult { get; set; }

    public int? SeedNumber { get; set; }

    public bool IsBye { get; set; }
}