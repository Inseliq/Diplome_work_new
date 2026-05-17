namespace CosmoManager.Responses.Admin;

public class AdminHomeBannerResponse
{
    public int Id { get; set; }

    public int Slot { get; set; }

    public string SlotLabel { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? ButtonLabel { get; set; }

    public string? ButtonUrl { get; set; }

    public string? ImageUrl { get; set; }

    public string? Gradient { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }

    public string CreatedAt { get; set; } = string.Empty;

    public string? UpdatedAt { get; set; }
}