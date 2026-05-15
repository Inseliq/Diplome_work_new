namespace CosmoManager.Models;

public class DirectoryFieldModificationItem
{
    public string Key { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }
}