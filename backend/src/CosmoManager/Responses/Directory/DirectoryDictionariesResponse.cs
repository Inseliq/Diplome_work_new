using System.Text.Json.Serialization;

namespace CosmoManager.Responses.Directory;

public sealed class DirectoryDictionariesResponse
{
    [JsonPropertyName("equipment")]
    public IReadOnlyCollection<DirectoryEquipmentItemResponse> Equipment { get; set; } = [];

    [JsonPropertyName("fieldModifications")]
    public IReadOnlyCollection<DirectoryFieldModificationItemResponse> FieldModifications { get; set; } = [];
}