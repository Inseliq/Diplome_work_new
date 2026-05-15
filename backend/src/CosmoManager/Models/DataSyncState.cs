namespace CosmoManager.Models;

public class DataSyncState
{
    public string Key { get; set; } = string.Empty;

    public DateTime? LastSuccessAtUtc { get; set; }

    public DateTime? LastErrorAtUtc { get; set; }

    public string? LastError { get; set; }
}