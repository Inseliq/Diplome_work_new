using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminTournamentRequest
{
    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Type { get; set; } = "common";

    [Range(1, 11)]
    public int Tier { get; set; } = 10;

    [Required]
    [StringLength(20)]
    public string Format { get; set; } = "7x7";

    [Range(1, 30)]
    public int TeamSize { get; set; } = 7;

    [Range(0, 30)]
    public int ReserveSize { get; set; } = 1;

    [Range(1, 1024)]
    public int? MaxParticipants { get; set; }

    [Range(0, 1024)]
    public int InitialParticipants { get; set; }

    [StringLength(100)]
    public string Classes { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string Status { get; set; } = "upcoming";

    public bool IsStream { get; set; }

    [StringLength(500)]
    public string? StreamUrl { get; set; }

    [Required]
    public DateTime DateStart { get; set; }

    [Required]
    public DateTime DateEnd { get; set; }

    [Required]
    public DateTime RegStart { get; set; }

    [Required]
    public DateTime RegEnd { get; set; }

    public bool OpenForAll { get; set; }

    [StringLength(100)]
    public string? Sponsor { get; set; }

    public string? PrizeText { get; set; }

    public bool IsPublished { get; set; } = true;

    public int? EventId { get; set; }
}