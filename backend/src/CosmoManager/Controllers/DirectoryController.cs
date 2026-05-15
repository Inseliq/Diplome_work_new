using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Responses.Directory;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DirectoryController : ControllerBase
{
    private const string IconsBase = "https://cdn.poliroid.me/icons/tanks_svg/ru";

    private readonly AppDbContext _dbContext;

    public DirectoryController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles(CancellationToken cancellationToken)
    {
        var vehicles = await _dbContext.Vehicles
            .AsNoTracking()
            .GroupJoin(
                _dbContext.DirectoryVehicles.AsNoTracking().Where(x => x.IsPublished),
                vehicle => vehicle.Id,
                directory => directory.VehicleId,
                (vehicle, directories) => new
                {
                    Vehicle = vehicle,
                    HasDirectory = directories.Any()
                })
            .OrderBy(x => x.Vehicle.Tier)
            .ThenBy(x => x.Vehicle.Name)
            .Select(x => new DirectoryVehicleListItemResponse
            {
                Id = x.Vehicle.Id,
                InternalName = x.Vehicle.InternalName,
                Nation = x.Vehicle.Nation,
                Type = x.Vehicle.Type,
                Tier = x.Vehicle.Tier,
                Name = x.Vehicle.Name,
                ShortName = x.Vehicle.ShortName,
                IsTechTree = x.Vehicle.IsTechTree,
                IsPremium = x.Vehicle.IsPremium,
                IsSpecial = x.Vehicle.IsSpecial,
                IsCollector = x.Vehicle.IsCollector,
                Role = x.Vehicle.Role,
                IconUrl = $"{IconsBase}/{x.Vehicle.InternalName}.svg",
                HasDirectory = x.HasDirectory
            })
            .ToListAsync(cancellationToken);

        return Ok(new
        {
            vehicles
        });
    }

    [HttpGet("vehicles/{id:int}")]
    public async Task<IActionResult> GetVehicleById(
        int id,
        CancellationToken cancellationToken)
    {
        var directoryVehicle = await _dbContext.DirectoryVehicles
            .AsNoTracking()
            .Include(x => x.Vehicle)
            .Include(x => x.Builds)
            .Include(x => x.FieldModifications)
            .FirstOrDefaultAsync(
                x => x.VehicleId == id && x.IsPublished,
                cancellationToken);

        if (directoryVehicle == null)
        {
            return NotFound(new
            {
                message = "Для выбранного танка сборка не найдена"
            });
        }

        var vehicle = directoryVehicle.Vehicle;

        var response = new DirectoryVehicleDetailResponse
        {
            Id = vehicle.Id,
            Image = directoryVehicle.ImageUrl ?? $"{IconsBase}/{vehicle.InternalName}.svg",
            Vehicle = new DirectoryVehicleListItemResponse
            {
                Id = vehicle.Id,
                InternalName = vehicle.InternalName,
                Nation = vehicle.Nation,
                Type = vehicle.Type,
                Tier = vehicle.Tier,
                Name = vehicle.Name,
                ShortName = vehicle.ShortName,
                IsTechTree = vehicle.IsTechTree,
                IsPremium = vehicle.IsPremium,
                IsSpecial = vehicle.IsSpecial,
                IsCollector = vehicle.IsCollector,
                Role = vehicle.Role,
                IconUrl = $"{IconsBase}/{vehicle.InternalName}.svg",
                HasDirectory = true
            },
            Polevaya = BuildPolevaya(directoryVehicle.FieldModifications),
            Battles = BuildBattles(directoryVehicle.Builds)
        };

        return Ok(response);
    }

    [HttpGet("dictionaries")]
    public async Task<IActionResult> GetDictionaries(CancellationToken cancellationToken)
    {
        var equipment = await _dbContext.DirectoryEquipmentItems
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Label)
            .Select(x => new DirectoryEquipmentItemResponse
            {
                Key = x.Key,
                Label = x.Label,
                Tier = x.Tier,
                ImageUrl = x.ImageUrl
            })
            .ToListAsync(cancellationToken);

        var fieldModifications = await _dbContext.DirectoryFieldModificationItems
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Label)
            .Select(x => new DirectoryFieldModificationItemResponse
            {
                Key = x.Key,
                Label = x.Label,
                ImageUrl = x.ImageUrl
            })
            .ToListAsync(cancellationToken);

        return Ok(new DirectoryDictionariesResponse
        {
            Equipment = equipment,
            FieldModifications = fieldModifications
        });
    }

    private static Dictionary<string, Dictionary<string, string[]>> BuildBattles(
        IEnumerable<DirectoryBuild> builds)
    {
        return builds
            .OrderBy(x => x.SortOrder)
            .GroupBy(x => x.ModeKey)
            .ToDictionary(
                modeGroup => modeGroup.Key,
                modeGroup => modeGroup.ToDictionary(
                    build => build.StateKey,
                    build => new[]
                    {
                        build.Equipment1Key,
                        build.Equipment2Key,
                        build.Equipment3Key
                    }));
    }

    private static Dictionary<string, List<object[]>>? BuildPolevaya(
        IEnumerable<DirectoryFieldModification> fieldModifications)
    {
        var result = fieldModifications
            .OrderBy(x => x.SortOrder)
            .GroupBy(x => x.SectionKey)
            .ToDictionary(
                sectionGroup => sectionGroup.Key,
                sectionGroup => sectionGroup
                    .SelectMany(x => new[]
                    {
                        new object[] { x.LeftItemKey, x.LeftSelected ? 1 : 0 },
                        new object[] { x.RightItemKey, x.RightSelected ? 1 : 0 }
                    })
                    .ToList());

        return result.Count == 0 ? null : result;
    }
}