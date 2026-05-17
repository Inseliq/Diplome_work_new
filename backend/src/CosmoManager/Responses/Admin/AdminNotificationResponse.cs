namespace CosmoManager.Responses.Admin;

public class AdminNotificationResponse
{
    public int Id { get; set; }

    public string Message { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? SourceButton { get; set; }

    public bool IsPublished { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public string CreatedAt { get; set; } = string.Empty;

    public DateTime? StartsAtUtc { get; set; }

    public DateTime? EndsAtUtc { get; set; }

    public int SortOrder { get; set; }
}

public class AdminNotificationsPageResponse
{
    public AdminNotificationResponse? Active { get; set; }

    public IReadOnlyCollection<AdminNotificationResponse> Items { get; set; } = [];
}