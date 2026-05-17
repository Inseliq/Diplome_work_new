using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminDirectoryBuildRequest
{
    /// <summary>
    /// random / fortified
    /// </summary>
    [Required]
    [StringLength(30)]
    public string ModeKey { get; set; } = "random";

    /// <summary>
    /// default / state1 / state2
    /// </summary>
    [Required]
    [StringLength(30)]
    public string StateKey { get; set; } = "default";

    [Required]
    [StringLength(100)]
    public string Equipment1Key { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Equipment2Key { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Equipment3Key { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}