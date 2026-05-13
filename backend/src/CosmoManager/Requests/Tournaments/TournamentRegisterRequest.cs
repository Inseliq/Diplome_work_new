using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Tournaments;

public class TournamentRegisterRequest
{
    [StringLength(100)]
    public string? TeamName { get; set; }

    [StringLength(100)]
    public string? Contact { get; set; }

    [StringLength(1000)]
    public string? Comment { get; set; }
}