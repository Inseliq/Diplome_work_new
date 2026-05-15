namespace CosmoManager.Models;

public class VehicleMark
{
    public int VehicleId { get; set; }

    public Vehicle Vehicle { get; set; } = null!;

    public int? Moe65 { get; set; }

    public int? Moe85 { get; set; }

    public int? Moe95 { get; set; }

    public int? Moe100 { get; set; }

    public DateTime UpdatedAtUtc { get; set; }
}