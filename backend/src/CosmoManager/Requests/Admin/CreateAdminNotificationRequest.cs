using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class CreateAdminNotificationRequest
{
    [Required]
    [StringLength(200)]
    public string Message { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [StringLength(500)]
    public string? SourceButton { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime? StartsAtUtc { get; set; }

    public DateTime? EndsAtUtc { get; set; }

    public int SortOrder { get; set; }
}