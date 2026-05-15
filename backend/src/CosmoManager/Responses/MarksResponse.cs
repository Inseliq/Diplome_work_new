using System.Text.Json.Serialization;

namespace CosmoManager.Responses;

public sealed class MarksResponse
{
    [JsonPropertyName("updated_at_utc")]
    public DateTime? UpdatedAtUtc { get; set; }

    [JsonPropertyName("tanks")]
    public IReadOnlyCollection<TankMarkResponse> Tanks { get; set; } = [];
}