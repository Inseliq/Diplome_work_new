using System.ComponentModel.DataAnnotations;
using CosmoManager.Models;

namespace CosmoManager.Requests;

public sealed class UpdateUserClanRankRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    public ClanRank Rank { get; set; }
}