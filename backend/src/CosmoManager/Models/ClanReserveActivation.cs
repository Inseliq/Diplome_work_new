namespace CosmoManager.Models;

public class ClanReserveActivation
{
    public int Id { get; set; }

    public int ClanId { get; set; }

    public Clan? Clan { get; set; }

    public ClanReserveType ReserveType { get; set; }

    public ClanReserveGroup ReserveGroup { get; set; }

    public string ActivatedByUserId { get; set; } = string.Empty;

    public AppUser? ActivatedByUser { get; set; }

    public DateTime ActivatedAtUtc { get; set; }

    public DateTime EndsAtUtc { get; set; }
}