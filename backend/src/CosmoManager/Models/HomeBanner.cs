using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class HomeBanner
{
    public int Id { get; set; }

    /// <summary>
    /// Позиция баннера на главной странице: 1 или 2.
    /// </summary>
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

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAtUtc { get; set; }
}