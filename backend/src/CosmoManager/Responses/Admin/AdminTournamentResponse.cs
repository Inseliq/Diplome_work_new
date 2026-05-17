namespace CosmoManager.Responses.Admin;

public class AdminTournamentResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int Tier { get; set; }

    public string Format { get; set; } = string.Empty;

    public int TeamSize { get; set; }

    public int ReserveSize { get; set; }

    public int? MaxParticipants { get; set; }

    public int InitialParticipants { get; set; }

    public int RegistrationsCount { get; set; }

    public int CurrentParticipants { get; set; }

    public string Classes { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public bool IsStream { get; set; }

    public string? StreamUrl { get; set; }

    public string DateStart { get; set; } = string.Empty;

    public string DateEnd { get; set; } = string.Empty;

    public string DateStartISO { get; set; } = string.Empty;

    public string DateEndISO { get; set; } = string.Empty;

    public string RegStart { get; set; } = string.Empty;

    public string RegEnd { get; set; } = string.Empty;

    public string RegStartISO { get; set; } = string.Empty;

    public string RegEndISO { get; set; } = string.Empty;

    public bool OpenForAll { get; set; }

    public string? Sponsor { get; set; }

    public string? PrizeText { get; set; }

    public bool IsPublished { get; set; }

    public int? EventId { get; set; }

    public string? EventTitle { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public string CreatedAt { get; set; } = string.Empty;

    public IReadOnlyCollection<AdminTournamentMapResponse> Maps { get; set; } = [];

    public IReadOnlyCollection<AdminTournamentPrizeResponse> Prizes { get; set; } = [];

    public IReadOnlyCollection<AdminTournamentRegistrationResponse> Registrations { get; set; } = [];
}

public class AdminTournamentMapResponse
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Image { get; set; } = string.Empty;
}

public class AdminTournamentPrizeResponse
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public string Place { get; set; } = string.Empty;

    public string PlaceLabel { get; set; } = string.Empty;

    public int Amount { get; set; }

    public string Type { get; set; } = string.Empty;

    public string? Text { get; set; }
}

public class AdminTournamentRegistrationResponse
{
    public int Id { get; set; }

    public int TournamentId { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string CaptainNickname { get; set; } = string.Empty;

    public string? CaptainEmail { get; set; }

    public string TeamName { get; set; } = string.Empty;

    public string? Contact { get; set; }

    public string? Comment { get; set; }

    public string Status { get; set; } = string.Empty;

    public string StatusLabel { get; set; } = string.Empty;

    public string? ReviewComment { get; set; }

    public DateTime? ReviewedAtUtc { get; set; }

    public string? ReviewedAt { get; set; }

    public IReadOnlyCollection<AdminTournamentRegistrationPlayerResponse> Players { get; set; } = [];

    public DateTime RegisteredAtUtc { get; set; }

    public string RegisteredAt { get; set; } = string.Empty;
}

public class AdminTournamentRegistrationPlayerResponse
{
    public int Id { get; set; }

    public string Nickname { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string RoleLabel { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}