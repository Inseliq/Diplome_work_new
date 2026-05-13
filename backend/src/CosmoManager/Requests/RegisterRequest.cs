using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests;

public sealed class RegisterRequest
{
    [Required(ErrorMessage = "Никнейм обязателен")]
    [MinLength(3, ErrorMessage = "Никнейм должен содержать минимум 3 символа")]
    [MaxLength(32, ErrorMessage = "Никнейм должен содержать максимум 32 символа")]
    public string Nickname { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email обязателен")]
    [EmailAddress(ErrorMessage = "Некорректный email")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Пароль обязателен")]
    [MinLength(8, ErrorMessage = "Пароль должен содержать минимум 8 символов")]
    public string Password { get; set; } = string.Empty;

    [Required(ErrorMessage = "Подтверждение пароля обязательно")]
    public string ConfirmPassword { get; set; } = string.Empty;
}