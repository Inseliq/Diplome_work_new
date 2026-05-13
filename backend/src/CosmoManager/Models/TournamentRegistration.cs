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

    public DateTime RegisteredAtUtc { get; set; } = DateTime.UtcNow;
}