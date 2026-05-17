using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminHomeBannerRequest
{
    [Range(1, 2, ErrorMessage = "Позиция баннера может быть только 1 или 2")]
    public int Slot { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ButtonLabel { get; set; }

    [StringLength(500)]
    public string? ButtonUrl { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? Gradient { get; set; }

    public bool IsPublished { get; set; } = true;
}