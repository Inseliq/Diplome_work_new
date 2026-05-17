using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminDirectoryFieldModificationRequest
{
    /// <summary>
    /// section1 / section2 / section3...
    /// </summary>
    [Required]
    [StringLength(30)]
    public string SectionKey { get; set; } = "section1";

    [Required]
    [StringLength(100)]
    public string LeftItemKey { get; set; } = string.Empty;

    public bool LeftSelected { get; set; }

    [Required]
    [StringLength(100)]
    public string RightItemKey { get; set; } = string.Empty;

    public bool RightSelected { get; set; }

    public int SortOrder { get; set; }
}