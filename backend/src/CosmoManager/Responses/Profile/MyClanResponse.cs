namespace CosmoManager.Responses.Profile;

public class MyClanResponse
{
    public int Id { get; set; }

    public string Tag { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int EloRating { get; set; }

    public int MembersCount { get; set; }

    public IReadOnlyCollection<MyClanMemberResponse> Members { get; set; } = [];
}

public class MyClanMemberResponse
{
    public string Id { get; set; } = string.Empty;

    public string Nickname { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string Rank { get; set; } = string.Empty;

    public string RankLabel { get; set; } = string.Empty;

    public bool IsCurrentUser { get; set; }
}