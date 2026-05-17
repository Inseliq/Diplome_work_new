using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Tournaments;

public class TournamentRegisterRequest
{
    [Required]
    [StringLength(100)]
    public string TeamName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Contact { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Comment { get; set; }

    public List<string> Members { get; set; } = [];

    public List<string> Reserves { get; set; } = [];
}