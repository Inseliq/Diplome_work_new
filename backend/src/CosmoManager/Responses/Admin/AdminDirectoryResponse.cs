namespace CosmoManager.Responses.Admin;

public class AdminDirectoryVehicleListItemResponse
{
    public int Id { get; set; }

    public string InternalName { get; set; } = string.Empty;

    public string Nation { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty;

    public int Tier { get; set; }

    public string Name { get; set; } = string.Empty;

    public string ShortName { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public string IconUrl { get; set; } = string.Empty;

    public bool HasDirectory { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsPublished { get; set; }

    public int BuildsCount { get; set; }

    public int FieldModificationsCount { get; set; }
}

public class AdminDirectoryVehicleDetailResponse
{
    public AdminDirectoryVehicleListItemResponse Vehicle { get; set; } = new();

    public bool HasDirectory { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsPublished { get; set; }

    public IReadOnlyCollection<AdminDirectoryBuildResponse> Builds { get; set; } = [];

    public IReadOnlyCollection<AdminDirectoryFieldModificationResponse> FieldModifications { get; set; } = [];
}

public class AdminDirectoryBuildResponse
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public string ModeKey { get; set; } = string.Empty;

    public string StateKey { get; set; } = string.Empty;

    public string Equipment1Key { get; set; } = string.Empty;

    public string Equipment2Key { get; set; } = string.Empty;

    public string Equipment3Key { get; set; } = string.Empty;

    public int SortOrder { get; set; }
}

public class AdminDirectoryFieldModificationResponse
{
    public int Id { get; set; }

    public int VehicleId { get; set; }

    public string SectionKey { get; set; } = string.Empty;

    public string LeftItemKey { get; set; } = string.Empty;

    public bool LeftSelected { get; set; }

    public string RightItemKey { get; set; } = string.Empty;

    public bool RightSelected { get; set; }

    public int SortOrder { get; set; }
}

public class AdminDirectoryEquipmentResponse
{
    public string Key { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string Tier { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public int SortOrder { get; set; }

    public int UsedInBuildsCount { get; set; }
}

public class AdminDirectoryFieldItemResponse
{
    public string Key { get; set; } = string.Empty;

    public string Label { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; }

    public int SortOrder { get; set; }

    public int UsedInFieldModificationsCount { get; set; }
}

public class AdminDirectoryDictionariesResponse
{
    public IReadOnlyCollection<AdminDirectoryEquipmentResponse> Equipment { get; set; } = [];

    public IReadOnlyCollection<AdminDirectoryFieldItemResponse> FieldModifications { get; set; } = [];
}