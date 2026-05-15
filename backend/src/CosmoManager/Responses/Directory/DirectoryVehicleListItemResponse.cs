using System.Text.Json.Serialization;

namespace CosmoManager.Responses.Directory;

public sealed class DirectoryVehicleListItemResponse
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("internalName")]
    public string InternalName { get; set; } = string.Empty;

    [JsonPropertyName("nation")]
    public string Nation { get; set; } = string.Empty;

    [JsonPropertyName("type")]
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("tier")]
    public int Tier { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("shortName")]
    public string ShortName { get; set; } = string.Empty;

    [JsonPropertyName("isTechTree")]
    public bool IsTechTree { get; set; }

    [JsonPropertyName("isPremium")]
    public bool IsPremium { get; set; }

    [JsonPropertyName("isSpecial")]
    public bool IsSpecial { get; set; }

    [JsonPropertyName("isCollector")]
    public bool IsCollector { get; set; }

    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

    [JsonPropertyName("iconUrl")]
    public string IconUrl { get; set; } = string.Empty;

    [JsonPropertyName("hasDirectory")]
    public bool HasDirectory { get; set; }
}