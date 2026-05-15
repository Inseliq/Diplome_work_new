using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests;

public sealed class AssignRoleRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;

    [Required]
    public string Role { get; set; } = string.Empty;
}