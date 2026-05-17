using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminTournamentMapRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(500)]
    public string Image { get; set; } = string.Empty;
}