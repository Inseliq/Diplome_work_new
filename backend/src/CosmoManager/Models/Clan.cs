namespace CosmoManager.Models;

public class Clan
{
    public int Id { get; set; }

    public string Tag { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public int EloRating { get; set; } = 1000;

    public DateTime CreatedAtUtc { get; set; }

    public ICollection<AppUser> Users { get; set; } = new List<AppUser>();
}