using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class TournamentRegistration
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public Tournament Tournament { get; set; } = null!;

    [Required]
    public string AppUserId { get; set; } = null!;

    public AppUser User { get; set; } = null!;

    [StringLength(100)]
    public string? TeamName { get; set; }

    [StringLength(100)]
    public string? Contact { get; set; }

    [StringLength(1000)]
    public string? Comment { get; set; }

    public TournamentRegistrationStatus Status { get; set; } = TournamentRegistrationStatus.Sent;

    public DateTime RegisteredAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? ReviewedAtUtc { get; set; }

    public string? ReviewedByUserId { get; set; }

    public AppUser? ReviewedByUser { get; set; }

    [StringLength(1000)]
    public string? ReviewComment { get; set; }

    public ICollection<TournamentRegistrationPlayer> Players { get; set; } = new List<TournamentRegistrationPlayer>();
}