using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class InfoItem
{
    public int Id { get; set; }

    public InfoItemType Type { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = null!;

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = null!;

    [StringLength(30)]
    public string? Status { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime? DateEnd { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? Gradient { get; set; }

    [StringLength(1000)]
    public string? Excerpt { get; set; }

    public string? Content { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}