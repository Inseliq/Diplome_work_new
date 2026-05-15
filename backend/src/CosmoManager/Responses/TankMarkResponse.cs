using System.Text.Json.Serialization;

namespace CosmoManager.Responses;

public sealed class TankMarkResponse
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

    [JsonPropertyName("moe_65")]
    public int? Moe65 { get; set; }

    [JsonPropertyName("moe_85")]
    public int? Moe85 { get; set; }

    [JsonPropertyName("moe_95")]
    public int? Moe95 { get; set; }

    [JsonPropertyName("moe_100")]
    public int? Moe100 { get; set; }
}