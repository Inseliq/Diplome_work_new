using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminDirectoryEquipmentRequest
{
    [Required]
    [RegularExpression(
        "^[A-Za-z0-9_-]{2,100}$",
        ErrorMessage = "Ключ должен быть от 2 до 100 символов и может содержать A-Z, a-z, 0-9, _, -."
    )]
    public string Key { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Label { get; set; } = string.Empty;

    /// <summary>
    /// std, bounty, experimental
    /// </summary>
    [Required]
    [StringLength(30)]
    public string Tier { get; set; } = "std";

    [Required]
    [StringLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public int SortOrder { get; set; }
}