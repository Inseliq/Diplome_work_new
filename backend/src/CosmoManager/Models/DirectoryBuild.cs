namespace CosmoManager.Models;

public class DirectoryBuild
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public DirectoryVehicle DirectoryVehicle { get; set; } = null!;

    public string ModeKey { get; set; } = string.Empty;

    public string StateKey { get; set; } = string.Empty;

    public string Equipment1Key { get; set; } = string.Empty;

    public string Equipment2Key { get; set; } = string.Empty;

    public string Equipment3Key { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

//ModeKey = random / fortified
//StateKey = default / state1 / state2
//Equipment1Key = rammer
//Equipment2Key = stabilizer
//Equipment3Key = vents