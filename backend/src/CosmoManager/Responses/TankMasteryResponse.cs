using System.Text.Json.Serialization;

namespace CosmoManager.Responses;

public sealed class TankMasteryResponse
{
    [JsonPropertyName("tank_id")]
    public int TankId { get; set; }

    [JsonPropertyName("internal_name")]
    public string InternalName { get; set; } = string.Empty;

    [JsonPropertyName("nation")]
    public string Nation { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("tier")]
    public int Tier { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("short_name")]
    public string ShortName { get; set; } = string.Empty;

    [JsonPropertyName("is_premium")]
    public bool IsPremium { get; set; }

    [JsonPropertyName("is_special")]
    public bool IsSpecial { get; set; }

    [JsonPropertyName("is_collector")]
    public bool IsCollector { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("deg3")]
    public int? Deg3 { get; set; }

    [JsonPropertyName("deg2")]
    public int? Deg2 { get; set; }

    [JsonPropertyName("deg1")]
    public int? Deg1 { get; set; }

    [JsonPropertyName("master")]
    public int? Master { get; set; }
}