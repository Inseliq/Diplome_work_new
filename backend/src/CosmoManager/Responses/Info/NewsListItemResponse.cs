namespace CosmoManager.Responses.Info;

public class NewsListItemResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Date { get; set; } = null!;

    public string DateISO { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string? Image { get; set; }

    public string? Gradient { get; set; }

    public string? Excerpt { get; set; }
}