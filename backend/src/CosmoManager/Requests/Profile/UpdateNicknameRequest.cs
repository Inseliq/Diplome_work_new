using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Profile;

public class UpdateNicknameRequest
{
    [Required]
    [RegularExpression(
        "^[A-Za-z0-9_]{3,24}$",
        ErrorMessage = "Никнейм должен быть от 3 до 24 символов и может содержать только A-Z, a-z, 0-9 и _."
    )]
    public string Nickname { get; set; } = string.Empty;
}