using Microsoft.AspNetCore.Identity;

namespace CosmoManager.Models;

public class AppUser : IdentityUser
{
    public string Nickname { get; set; } = string.Empty;

    public int? ClanId { get; set; }

    public Clan? Clan { get; set; }

    public ClanRank? ClanRank { get; set; }
}