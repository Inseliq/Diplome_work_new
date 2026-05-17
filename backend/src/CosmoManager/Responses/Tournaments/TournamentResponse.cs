namespace CosmoManager.Responses.Tournaments;

public class TournamentResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public string Type { get; set; } = null!;

    public int Tier { get; set; }

    public string Format { get; set; } = null!;

    public int TeamSize { get; set; }

    public int ReserveSize { get; set; }

    public int? MaxParticipants { get; set; }

    public int CurrentParticipants { get; set; }

    public string[] Classes { get; set; } = [];

    public string Status { get; set; } = null!;

    public bool IsStream { get; set; }

    public string? StreamUrl { get; set; }

    public string DateStart { get; set; } = null!;

    public string DateEnd { get; set; } = null!;

    public string DateStartISO { get; set; } = null!;

    public string DateEndISO { get; set; } = null!;

    public string RegStart { get; set; } = null!;

    public string RegEnd { get; set; } = null!;

    public string RegStartISO { get; set; } = null!;

    public string RegEndISO { get; set; } = null!;

    public bool OpenForAll { get; set; }

    public string? Sponsor { get; set; }

    public int? EventId { get; set; }

    public List<TournamentMapResponse> Maps { get; set; } = [];

    public TournamentPrizesResponse Prizes { get; set; } = new();

    public string? PrizeText { get; set; }

    public bool IsRegistered { get; set; }

    public TournamentMyRegistrationResponse? MyRegistration { get; set; }
}

public class TournamentMapResponse
{
    public string Name { get; set; } = null!;

    public string Image { get; set; } = null!;
}

public class TournamentPrizesResponse
{
    public TournamentPrizeResponse? Place1 { get; set; }

    public TournamentPrizeResponse? Place2 { get; set; }

    public TournamentPrizeResponse? Place3 { get; set; }

    public TournamentPrizeResponse? Others { get; set; }
}

public class TournamentPrizeResponse
{
    public int Amount { get; set; }

    public string Type { get; set; } = null!;

    public string? Text { get; set; }
}