namespace CosmoManager.Responses.Admin;

public class AdminClanReserveResponse
{
    public int Id { get; set; }

    public string Tag { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public int EloRating { get; set; }

    public int MembersCount { get; set; }

    public IReadOnlyCollection<AdminReserveGroupResponse> Groups { get; set; } = [];
}

public class AdminReserveGroupResponse
{
    public string Key { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public AdminActiveReserveResponse? ActiveReserve { get; set; }

    public IReadOnlyCollection<AdminReserveItemResponse> Reserves { get; set; } = [];
}

public class AdminReserveItemResponse
{
    public string Type { get; set; } = string.Empty;

    public string Group { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string BonusText { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public int Stock { get; set; }

    public DateTime? UpdatedAtUtc { get; set; }
}

public class AdminActiveReserveResponse
{
    public int Id { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public DateTime ActivatedAtUtc { get; set; }

    public DateTime EndsAtUtc { get; set; }

    public string ActivatedByNickname { get; set; } = string.Empty;
}