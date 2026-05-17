using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminTournamentRegistrationReviewRequest
{
    [StringLength(1000)]
    public string? Comment { get; set; }
}