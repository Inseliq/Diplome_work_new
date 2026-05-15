//section1: [['item__1', 0], ['item__2', 1]]

namespace CosmoManager.Models;

public class DirectoryFieldModification
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public DirectoryVehicle DirectoryVehicle { get; set; } = null!;

    public string SectionKey { get; set; } = string.Empty;

    public string LeftItemKey { get; set; } = string.Empty;

    public bool LeftSelected { get; set; }

    public string RightItemKey { get; set; } = string.Empty;

    public bool RightSelected { get; set; }

    public int SortOrder { get; set; }
}