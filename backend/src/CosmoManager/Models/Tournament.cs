using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Models;

public class Tournament
{
    public int Id { get; set; }

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = null!;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = null!;

    [Required]
    [StringLength(30)]
    public string Type { get; set; } = "common";

    public int Tier { get; set; }

    [Required]
    [StringLength(20)]
    public string Format { get; set; } = null!;

    public int TeamSize { get; set; }

    public int ReserveSize { get; set; }

    public int? MaxParticipants { get; set; }

    public int InitialParticipants { get; set; }

    [StringLength(100)]
    public string Classes { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "upcoming";

    public bool IsStream { get; set; }

    [StringLength(500)]
    public string? StreamUrl { get; set; }

    public DateTime DateStart { get; set; }

    public DateTime DateEnd { get; set; }

    public DateTime RegStart { get; set; }

    public DateTime RegEnd { get; set; }

    public bool OpenForAll { get; set; }

    [StringLength(100)]
    public string? Sponsor { get; set; }

    public string? PrizeText { get; set; }

    public bool IsPublished { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public int? EventId { get; set; }

    public InfoItem? Event { get; set; }

    public ICollection<TournamentMap> Maps { get; set; } = new List<TournamentMap>();

    public ICollection<TournamentPrize> Prizes { get; set; } = new List<TournamentPrize>();

    public ICollection<TournamentRegistration> Registrations { get; set; } = new List<TournamentRegistration>();

    public ICollection<TournamentMatch> Matches { get; set; } = new List<TournamentMatch>();
}