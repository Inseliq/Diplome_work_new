namespace CosmoManager.Models;

public class Vehicle
{
    public int Id { get; set; }

    public string InternalName { get; set; } = string.Empty;

    public string Nation { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int Tier { get; set; }

    public string Name { get; set; } = string.Empty;

    public string ShortName { get; set; } = string.Empty;

    public bool IsTechTree { get; set; }

    public bool IsPremium { get; set; }

    public bool IsSpecial { get; set; }

    public bool IsCollector { get; set; }

    public string Role { get; set; } = string.Empty;

    public DateTime UpdatedAtUtc { get; set; }

    public VehicleMark? Mark { get; set; }

    public VehicleMastery? Mastery { get; set; }
}