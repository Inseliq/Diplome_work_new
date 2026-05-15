namespace CosmoManager.Models;

public class PopupNotification
{
    public int Id { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? SourceButton { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? StartsAtUtc { get; set; }

    public DateTime? EndsAtUtc { get; set; }

    public int SortOrder { get; set; }
}