using System.Text.Json.Serialization;

namespace CosmoManager.Responses.Directory;

public sealed class DirectoryEquipmentItemResponse
{
    [JsonPropertyName("key")]
    public string Key { get; set; } = string.Empty;

    [JsonPropertyName("label")]
    public string Label { get; set; } = string.Empty;

    [JsonPropertyName("tier")]
    public string Tier { get; set; } = string.Empty;

    [JsonPropertyName("img")]
    public string ImageUrl { get; set; } = string.Empty;
}