using System.Text.Json.Serialization;

namespace CosmoManager.Responses;

public sealed class MastersResponse
{
    [JsonPropertyName("updated_at_utc")]
    public DateTime? UpdatedAtUtc { get; set; }

    [JsonPropertyName("tanks")]
    public IReadOnlyCollection<TankMasteryResponse> Tanks { get; set; } = [];
}