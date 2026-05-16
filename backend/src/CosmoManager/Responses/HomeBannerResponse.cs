namespace CosmoManager.Responses;

public class HomeBannerResponse
{
    public int Id { get; set; }

    public int Slot { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? ButtonLabel { get; set; }

    public string? ButtonUrl { get; set; }

    public string? ImageUrl { get; set; }

    public string? Gradient { get; set; }
}