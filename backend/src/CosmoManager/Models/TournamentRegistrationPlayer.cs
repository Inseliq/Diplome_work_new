using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class TournamentRegistrationPlayer
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public Tournament Tournament { get; set; } = null!;

    public int RegistrationId { get; set; }

    public TournamentRegistration Registration { get; set; } = null!;

    [Required]
    [StringLength(64)]
    public string Nickname { get; set; } = string.Empty;

    [Required]
    [StringLength(64)]
    public string NormalizedNickname { get; set; } = string.Empty;

    public TournamentRegistrationPlayerRole Role { get; set; }

    public int SortOrder { get; set; }

    /// <summary>
    /// true — ник занимает слот в турнире.
    /// false — ник больше не блокирует регистрацию, например после отклонения заявки.
    /// </summary>
    public bool BlocksNickname { get; set; } = true;
}