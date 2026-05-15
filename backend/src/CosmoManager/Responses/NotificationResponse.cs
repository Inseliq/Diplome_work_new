using System.Text.Json.Serialization;

namespace CosmoManager.Responses;

public sealed class NotificationResponse
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;

    [JsonPropertyName("src-btn")]
    public string? SourceButton { get; set; }
}