using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class TournamentMatch
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public Tournament Tournament { get; set; } = null!;

    /// <summary>
    /// upper, lower, final, grandFinal
    /// </summary>
    [Required]
    [StringLength(30)]
    public string Bracket { get; set; } = "upper";

    /// <summary>
    /// 128 -> 1/64, 64 -> 1/32, 32 -> 1/16, 16 -> 1/8,
    /// 8 -> 1/4, 4 -> 1/2, 2 -> финал
    /// </summary>
    public int RoundSize { get; set; } = 2;

    public int RoundNumber { get; set; } = 1;

    public int MatchNumber { get; set; } = 1;

    /// <summary>
    /// scheduled, live, finished, cancelled
    /// </summary>
    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "scheduled";

    /// <summary>
    /// pending, team1_win, team2_win, draw, tech_team1, tech_team2
    /// </summary>
    [Required]
    [StringLength(30)]
    public string ResultStatus { get; set; } = "pending";

    public int Team1Score { get; set; }

    public int Team2Score { get; set; }

    public int? WinnerRegistrationId { get; set; }

    public TournamentRegistration? WinnerRegistration { get; set; }

    /// <summary>
    /// Кто проходит дальше по сетке.
    /// Обычно совпадает с WinnerRegistrationId.
    /// При ничьей выбирается вручную.
    /// </summary>
    public int? AdvancingRegistrationId { get; set; }

    public TournamentRegistration? AdvancingRegistration { get; set; }

    public int? WinnerToMatchId { get; set; }

    public int? WinnerToSlotNumber { get; set; }

    public int? LoserToMatchId { get; set; }

    public int? LoserToSlotNumber { get; set; }

    public DateTime? ScheduledAtUtc { get; set; }

    public DateTime? StartedAtUtc { get; set; }

    public DateTime? FinishedAtUtc { get; set; }

    [StringLength(500)]
    public string? StreamUrl { get; set; }

    [StringLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<TournamentMatchSlot> Slots { get; set; } = new List<TournamentMatchSlot>();
}