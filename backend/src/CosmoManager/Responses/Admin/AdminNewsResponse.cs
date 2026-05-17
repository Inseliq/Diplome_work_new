namespace CosmoManager.Responses.Admin;

public class AdminNewsResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Category { get; set; } = string.Empty;

    public string Date { get; set; } = string.Empty;

    public string DateISO { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public string? Gradient { get; set; }

    public string? Excerpt { get; set; }

    public string? Content { get; set; }

    public bool IsPublished { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public string CreatedAt { get; set; } = string.Empty;
}