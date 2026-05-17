namespace CosmoManager.Responses.Admin;

public class AdminEventResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public string DateStart { get; set; } = string.Empty;

    public string DateEnd { get; set; } = string.Empty;

    public string DateStartISO { get; set; } = string.Empty;

    public string DateEndISO { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public string? Gradient { get; set; }

    public string? Excerpt { get; set; }

    public string? Content { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public string CreatedAt { get; set; } = string.Empty;
}