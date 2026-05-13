using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class TournamentMap
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public Tournament Tournament { get; set; } = null!;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(500)]
    public string Image { get; set; } = null!;
}