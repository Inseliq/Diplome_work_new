using System.Text.Json.Serialization;

namespace CosmoManager.Responses.Directory;

public sealed class DirectoryVehicleDetailResponse
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("image")]
    public string? Image { get; set; }

    [JsonPropertyName("vehicle")]
    public DirectoryVehicleListItemResponse Vehicle { get; set; } = null!;

    [JsonPropertyName("polevaya")]
    public Dictionary<string, List<object[]>>? Polevaya { get; set; }

    [JsonPropertyName("battles")]
    public Dictionary<string, Dictionary<string, string[]>> Battles { get; set; } = [];
}