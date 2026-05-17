using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminNewsRequest
{
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public DateTime DateStart { get; set; }

    [StringLength(500)]
    public string? ImageUrl { get; set; }

    [StringLength(500)]
    public string? Gradient { get; set; }

    [StringLength(1000)]
    public string? Excerpt { get; set; }

    public string? Content { get; set; }

    public bool IsPublished { get; set; } = true;
}