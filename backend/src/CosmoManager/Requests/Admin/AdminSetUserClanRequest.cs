using System.ComponentModel.DataAnnotations;
using CosmoManager.Models;

namespace CosmoManager.Requests.Admin;

public class AdminSetUserClanRequest
{
    [Required]
    public int ClanId { get; set; }

    [Required]
    public ClanRank Rank { get; set; } = ClanRank.Recruit;
}