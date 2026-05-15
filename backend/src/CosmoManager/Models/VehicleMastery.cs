namespace CosmoManager.Models;

public class VehicleMastery
{
    public int VehicleId { get; set; }

    public Vehicle Vehicle { get; set; } = null!;

    public int? Deg3 { get; set; }

    public int? Deg2 { get; set; }

    public int? Deg1 { get; set; }

    public int? Master { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}