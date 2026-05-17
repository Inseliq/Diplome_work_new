using System.ComponentModel.DataAnnotations;
using CosmoManager.Models;

namespace CosmoManager.Requests.Admin;

public class AdminUpdateUserClanRankRequest
{
    [Required]
    public ClanRank Rank { get; set; }
}