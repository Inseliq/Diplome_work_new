namespace CosmoManager.Models;

public class DirectoryVehicle
{
    public int VehicleId { get; set; }

    public Vehicle Vehicle { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<DirectoryBuild> Builds { get; set; } = [];

    public ICollection<DirectoryFieldModification> FieldModifications { get; set; } = [];
}