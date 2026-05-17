using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminDirectoryVehicleRequest
{
    [StringLength(500)]
    public string? ImageUrl { get; set; }

    public bool IsPublished { get; set; } = true;
}