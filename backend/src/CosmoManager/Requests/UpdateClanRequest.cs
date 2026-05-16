using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests;

public sealed class UpdateClanRequest
{
    [Required]
    [RegularExpression("^[A-Za-z0-9_-]{3,5}$", ErrorMessage = "Тег клана должен быть от 3 до 5 символов и может содержать только A-Z, a-z, 0-9, -, _.")]
    public string Tag { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 100000)]
    public int EloRating { get; set; } = 1000;
}