using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Profile;

public class UpdateEmailRequest
{
    [Required]
    [EmailAddress(ErrorMessage = "Некорректная почта")]
    public string Email { get; set; } = string.Empty;
}