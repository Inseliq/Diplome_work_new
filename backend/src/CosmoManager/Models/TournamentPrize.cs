using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class TournamentPrize
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public Tournament Tournament { get; set; } = null!;

    [Required]
    [StringLength(30)]
    public string Place { get; set; } = null!;

    public int Amount { get; set; }

    [Required]
    [StringLength(30)]
    public string Type { get; set; } = null!;

    [StringLength(300)]
    public string? Text { get; set; }
}