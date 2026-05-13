namespace CosmoManager.Responses.Info;

public class EventListItemResponse
{
    public int Id { get; set; }

    public string Title { get; set; } = null!;

    public string Category { get; set; } = null!;

    public string Status { get; set; } = null!;

    public string DateStart { get; set; } = null!;

    public string DateEnd { get; set; } = null!;

    public string DateStartISO { get; set; } = null!;

    public string DateEndISO { get; set; } = null!;

    public string? Image { get; set; }

    public string? Gradient { get; set; }

    public string? Excerpt { get; set; }
}