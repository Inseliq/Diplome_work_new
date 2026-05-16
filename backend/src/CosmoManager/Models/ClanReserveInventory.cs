namespace CosmoManager.Models;

public class ClanReserveInventory
{
    public int ClanId { get; set; }

    public Clan? Clan { get; set; }

    public ClanReserveType ReserveType { get; set; }

    public int Amount { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}