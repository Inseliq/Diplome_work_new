using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class RefreshToken
{
    public int Id { get; set; }

    [Required]
    public string TokenHash { get; set; } = string.Empty;

    [Required]
    public string AppUserId { get; set; } = string.Empty;

    public AppUser User { get; set; } = null!;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateTime ExpiresAtUtc { get; set; }

    public DateTime? RevokedAtUtc { get; set; }

    public string? ReplacedByTokenHash { get; set; }

    public string? CreatedByIp { get; set; }

    public string? RevokedByIp { get; set; }

    public string? UserAgent { get; set; }

    public bool IsExpired => DateTime.UtcNow >= ExpiresAtUtc;

    public bool IsActive => RevokedAtUtc == null && !IsExpired;
}
