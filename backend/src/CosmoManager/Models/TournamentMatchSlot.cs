using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class TournamentMatchSlot
{
    public int Id { get; set; }

    public int MatchId { get; set; }

    public TournamentMatch Match { get; set; } = null!;

    /// <summary>
    /// 1 или 2.
    /// </summary>
    public int SlotNumber { get; set; }

    /// <summary>
    /// Если команда уже известна.
    /// </summary>
    public int? RegistrationId { get; set; }

    public TournamentRegistration? Registration { get; set; }

    /// <summary>
    /// Если команда должна прийти из другого матча.
    /// </summary>
    public int? SourceMatchId { get; set; }

    public TournamentMatch? SourceMatch { get; set; }

    /// <summary>
    /// winner или loser.
    /// </summary>
    [StringLength(20)]
    public string? SourceResult { get; set; }

    public int? SeedNumber { get; set; }

    public bool IsBye { get; set; }
}