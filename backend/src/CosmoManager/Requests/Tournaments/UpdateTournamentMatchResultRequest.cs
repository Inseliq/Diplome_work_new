using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Tournaments;

public class UpdateTournamentMatchResultRequest
{
    public int Team1Score { get; set; }

    public int Team2Score { get; set; }

    /// <summary>
    /// pending, team1_win, team2_win, draw, tech_team1, tech_team2
    /// </summary>
    [Required]
    [StringLength(30)]
    public string ResultStatus { get; set; } = "pending";

    /// <summary>
    /// При ничьей указывается вручную.
    /// При победе можно не передавать — backend определит сам.
    /// </summary>
    public int? AdvancingRegistrationId { get; set; }

    /// <summary>
    /// scheduled, live, finished, cancelled
    /// </summary>
    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "finished";
}