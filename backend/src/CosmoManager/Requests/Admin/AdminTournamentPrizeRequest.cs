using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminTournamentPrizeRequest
{
    [Required]
    [StringLength(30)]
    public string Place { get; set; } = "place1";

    [Range(0, 1_000_000_000)]
    public int Amount { get; set; }

    [Required]
    [StringLength(30)]
    public string Type { get; set; } = "gold";

    [StringLength(300)]
    public string? Text { get; set; }
}