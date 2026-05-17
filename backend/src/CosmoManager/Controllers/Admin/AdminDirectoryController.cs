using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests.Admin;
using CosmoManager.Responses.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers.Admin;

[ApiController]
[Route("api/admin/directory")]
[Authorize]
public class AdminDirectoryController : ControllerBase
{
    private const string IconsBase = "https://cdn.poliroid.me/icons/tanks_svg/ru";

    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminDirectoryController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    // ─────────────────────────────────────────────
    // Dictionaries
    // ─────────────────────────────────────────────

    [HttpGet("dictionaries")]
    public async Task<IActionResult> GetDictionaries(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var equipment = await _dbContext.DirectoryEquipmentItems
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Label)
            .Select(x => new AdminDirectoryEquipmentResponse
            {
                Key = x.Key,
                Label = x.Label,
                Tier = x.Tier,
                ImageUrl = x.ImageUrl,
                IsActive = x.IsActive,
                SortOrder = x.SortOrder,
                UsedInBuildsCount = _dbContext.DirectoryBuilds.Count(b =>
                    b.Equipment1Key == x.Key ||
                    b.Equipment2Key == x.Key ||
                    b.Equipment3Key == x.Key)
            })
            .ToListAsync(cancellationToken);

        var fieldModifications = await _dbContext.DirectoryFieldModificationItems
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Label)
            .Select(x => new AdminDirectoryFieldItemResponse
            {
                Key = x.Key,
                Label = x.Label,
                ImageUrl = x.ImageUrl,
                IsActive = x.IsActive,
                SortOrder = x.SortOrder,
                UsedInFieldModificationsCount = _dbContext.DirectoryFieldModifications.Count(f =>
                    f.LeftItemKey == x.Key ||
                    f.RightItemKey == x.Key)
            })
            .ToListAsync(cancellationToken);

        return Ok(new AdminDirectoryDictionariesResponse
        {
            Equipment = equipment,
            FieldModifications = fieldModifications
        });
    }

    // ─────────────────────────────────────────────
    // Equipment
    // ─────────────────────────────────────────────

    [HttpPost("equipment")]
    public async Task<IActionResult> CreateEquipment(
        [FromBody] AdminDirectoryEquipmentRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var key = request.Key.Trim();

        var exists = await _dbContext.DirectoryEquipmentItems
            .AnyAsync(x => x.Key == key, cancellationToken);

        if (exists)
        {
            return BadRequest(new
            {
                message = "Оборудование с таким ключом уже существует"
            });
        }

        var item = new DirectoryEquipmentItem
        {
            Key = key,
            Label = request.Label.Trim(),
            Tier = request.Tier.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
            IsActive = request.IsActive,
            SortOrder = request.SortOrder
        };

        _dbContext.DirectoryEquipmentItems.Add(item);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Оборудование добавлено",
            dictionaries = await BuildDictionariesAsync(cancellationToken)
        });
    }

    [HttpPut("equipment/{key}")]
    public async Task<IActionResult> UpdateEquipment(
        [FromRoute] string key,
        [FromBody] AdminDirectoryEquipmentRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var item = await _dbContext.DirectoryEquipmentItems
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Оборудование не найдено"
            });
        }

        var newKey = request.Key.Trim();

        if (!string.Equals(key, newKey, StringComparison.Ordinal))
        {
            var keyBusy = await _dbContext.DirectoryEquipmentItems
                .AnyAsync(x => x.Key == newKey, cancellationToken);

            if (keyBusy)
            {
                return BadRequest(new
                {
                    message = "Новый ключ оборудования уже используется"
                });
            }

            var builds = await _dbContext.DirectoryBuilds
                .Where(x =>
                    x.Equipment1Key == key ||
                    x.Equipment2Key == key ||
                    x.Equipment3Key == key)
                .ToListAsync(cancellationToken);

            foreach (var build in builds)
            {
                if (build.Equipment1Key == key) build.Equipment1Key = newKey;
                if (build.Equipment2Key == key) build.Equipment2Key = newKey;
                if (build.Equipment3Key == key) build.Equipment3Key = newKey;
            }

            _dbContext.DirectoryEquipmentItems.Remove(item);

            _dbContext.DirectoryEquipmentItems.Add(new DirectoryEquipmentItem
            {
                Key = newKey,
                Label = request.Label.Trim(),
                Tier = request.Tier.Trim(),
                ImageUrl = request.ImageUrl.Trim(),
                IsActive = request.IsActive,
                SortOrder = request.SortOrder
            });
        }
        else
        {
            item.Label = request.Label.Trim();
            item.Tier = request.Tier.Trim();
            item.ImageUrl = request.ImageUrl.Trim();
            item.IsActive = request.IsActive;
            item.SortOrder = request.SortOrder;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Оборудование обновлено",
            dictionaries = await BuildDictionariesAsync(cancellationToken)
        });
    }

    [HttpDelete("equipment/{key}")]
    public async Task<IActionResult> DeleteEquipment(
        [FromRoute] string key,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var item = await _dbContext.DirectoryEquipmentItems
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Оборудование не найдено"
            });
        }

        var used = await _dbContext.DirectoryBuilds
            .AnyAsync(x =>
                x.Equipment1Key == key ||
                x.Equipment2Key == key ||
                x.Equipment3Key == key,
                cancellationToken);

        if (used)
        {
            return BadRequest(new
            {
                message = "Это оборудование используется в сборках. Сначала замените его в сборках или сделайте неактивным."
            });
        }

        _dbContext.DirectoryEquipmentItems.Remove(item);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Оборудование удалено",
            dictionaries = await BuildDictionariesAsync(cancellationToken)
        });
    }

    // ─────────────────────────────────────────────
    // Field modification items
    // ─────────────────────────────────────────────

    [HttpPost("field-items")]
    public async Task<IActionResult> CreateFieldItem(
        [FromBody] AdminDirectoryFieldItemRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var key = request.Key.Trim();

        var exists = await _dbContext.DirectoryFieldModificationItems
            .AnyAsync(x => x.Key == key, cancellationToken);

        if (exists)
        {
            return BadRequest(new
            {
                message = "Элемент полевой модернизации с таким ключом уже существует"
            });
        }

        _dbContext.DirectoryFieldModificationItems.Add(new DirectoryFieldModificationItem
        {
            Key = key,
            Label = request.Label.Trim(),
            ImageUrl = request.ImageUrl.Trim(),
            IsActive = request.IsActive,
            SortOrder = request.SortOrder
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Элемент полевой модернизации добавлен",
            dictionaries = await BuildDictionariesAsync(cancellationToken)
        });
    }

    [HttpPut("field-items/{key}")]
    public async Task<IActionResult> UpdateFieldItem(
        [FromRoute] string key,
        [FromBody] AdminDirectoryFieldItemRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var item = await _dbContext.DirectoryFieldModificationItems
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Элемент полевой модернизации не найден"
            });
        }

        var newKey = request.Key.Trim();

        if (!string.Equals(key, newKey, StringComparison.Ordinal))
        {
            var keyBusy = await _dbContext.DirectoryFieldModificationItems
                .AnyAsync(x => x.Key == newKey, cancellationToken);

            if (keyBusy)
            {
                return BadRequest(new
                {
                    message = "Новый ключ полевой модернизации уже используется"
                });
            }

            var fieldModifications = await _dbContext.DirectoryFieldModifications
                .Where(x => x.LeftItemKey == key || x.RightItemKey == key)
                .ToListAsync(cancellationToken);

            foreach (var fieldModification in fieldModifications)
            {
                if (fieldModification.LeftItemKey == key) fieldModification.LeftItemKey = newKey;
                if (fieldModification.RightItemKey == key) fieldModification.RightItemKey = newKey;
            }

            _dbContext.DirectoryFieldModificationItems.Remove(item);

            _dbContext.DirectoryFieldModificationItems.Add(new DirectoryFieldModificationItem
            {
                Key = newKey,
                Label = request.Label.Trim(),
                ImageUrl = request.ImageUrl.Trim(),
                IsActive = request.IsActive,
                SortOrder = request.SortOrder
            });
        }
        else
        {
            item.Label = request.Label.Trim();
            item.ImageUrl = request.ImageUrl.Trim();
            item.IsActive = request.IsActive;
            item.SortOrder = request.SortOrder;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Элемент полевой модернизации обновлён",
            dictionaries = await BuildDictionariesAsync(cancellationToken)
        });
    }

    [HttpDelete("field-items/{key}")]
    public async Task<IActionResult> DeleteFieldItem(
        [FromRoute] string key,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var item = await _dbContext.DirectoryFieldModificationItems
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Элемент полевой модернизации не найден"
            });
        }

        var used = await _dbContext.DirectoryFieldModifications
            .AnyAsync(x => x.LeftItemKey == key || x.RightItemKey == key, cancellationToken);

        if (used)
        {
            return BadRequest(new
            {
                message = "Этот элемент используется в полевой модернизации техники. Сначала замените его или сделайте неактивным."
            });
        }

        _dbContext.DirectoryFieldModificationItems.Remove(item);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Элемент полевой модернизации удалён",
            dictionaries = await BuildDictionariesAsync(cancellationToken)
        });
    }

    // ─────────────────────────────────────────────
    // Vehicles
    // ─────────────────────────────────────────────

    [HttpGet("vehicles")]
    public async Task<IActionResult> GetVehicles(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var query = _dbContext.Vehicles
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();

            query = query.Where(x =>
                x.Name.ToLower().Contains(normalized) ||
                x.ShortName.ToLower().Contains(normalized) ||
                x.InternalName.ToLower().Contains(normalized) ||
                x.Nation.ToLower().Contains(normalized) ||
                x.Type.ToLower().Contains(normalized));
        }

        var vehicles = await query
            .OrderByDescending(x => x.Tier)
            .ThenBy(x => x.Name)
            .Take(300)
            .ToListAsync(cancellationToken);

        var vehicleIds = vehicles.Select(x => x.Id).ToArray();

        var directories = await _dbContext.DirectoryVehicles
            .AsNoTracking()
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .ToDictionaryAsync(x => x.VehicleId, cancellationToken);

        var buildsCounts = await _dbContext.DirectoryBuilds
            .AsNoTracking()
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .GroupBy(x => x.VehicleId)
            .Select(x => new
            {
                VehicleId = x.Key,
                Count = x.Count()
            })
            .ToDictionaryAsync(x => x.VehicleId, x => x.Count, cancellationToken);

        var fieldCounts = await _dbContext.DirectoryFieldModifications
            .AsNoTracking()
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .GroupBy(x => x.VehicleId)
            .Select(x => new
            {
                VehicleId = x.Key,
                Count = x.Count()
            })
            .ToDictionaryAsync(x => x.VehicleId, x => x.Count, cancellationToken);

        var response = vehicles.Select(vehicle =>
        {
            directories.TryGetValue(vehicle.Id, out var directory);
            buildsCounts.TryGetValue(vehicle.Id, out var buildsCount);
            fieldCounts.TryGetValue(vehicle.Id, out var fieldCount);

            return ToVehicleListResponse(vehicle, directory, buildsCount, fieldCount);
        });

        return Ok(response);
    }

    [HttpGet("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> GetVehicle(
        [FromRoute] int vehicleId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var response = await BuildVehicleDetailAsync(vehicleId, cancellationToken);

        if (response == null)
        {
            return NotFound(new
            {
                message = "Техника не найдена"
            });
        }

        return Ok(response);
    }

    [HttpPut("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> UpsertVehicleDirectory(
        [FromRoute] int vehicleId,
        [FromBody] AdminDirectoryVehicleRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var vehicleExists = await _dbContext.Vehicles
            .AnyAsync(x => x.Id == vehicleId, cancellationToken);

        if (!vehicleExists)
        {
            return NotFound(new
            {
                message = "Техника не найдена"
            });
        }

        var directoryVehicle = await _dbContext.DirectoryVehicles
            .FirstOrDefaultAsync(x => x.VehicleId == vehicleId, cancellationToken);

        if (directoryVehicle == null)
        {
            directoryVehicle = new DirectoryVehicle
            {
                VehicleId = vehicleId,
                ImageUrl = NormalizeNullable(request.ImageUrl),
                IsPublished = request.IsPublished,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _dbContext.DirectoryVehicles.Add(directoryVehicle);
        }
        else
        {
            directoryVehicle.ImageUrl = NormalizeNullable(request.ImageUrl);
            directoryVehicle.IsPublished = request.IsPublished;
            directoryVehicle.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Настройки страницы техники сохранены",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    [HttpDelete("vehicles/{vehicleId:int}")]
    public async Task<IActionResult> DeleteVehicleDirectory(
        [FromRoute] int vehicleId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var directoryVehicle = await _dbContext.DirectoryVehicles
            .FirstOrDefaultAsync(x => x.VehicleId == vehicleId, cancellationToken);

        if (directoryVehicle == null)
        {
            return NotFound(new
            {
                message = "Страница техники не найдена"
            });
        }

        _dbContext.DirectoryVehicles.Remove(directoryVehicle);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Страница техники и её сборки удалены"
        });
    }

    // ─────────────────────────────────────────────
    // Builds
    // ─────────────────────────────────────────────

    [HttpPost("vehicles/{vehicleId:int}/builds")]
    public async Task<IActionResult> CreateBuild(
        [FromRoute] int vehicleId,
        [FromBody] AdminDirectoryBuildRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var validationError = await ValidateBuildRequestAsync(
            vehicleId,
            request,
            currentBuildId: null,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        await EnsureDirectoryVehicleAsync(vehicleId, cancellationToken);

        _dbContext.DirectoryBuilds.Add(new DirectoryBuild
        {
            VehicleId = vehicleId,
            ModeKey = request.ModeKey.Trim(),
            StateKey = request.StateKey.Trim(),
            Equipment1Key = request.Equipment1Key.Trim(),
            Equipment2Key = request.Equipment2Key.Trim(),
            Equipment3Key = request.Equipment3Key.Trim(),
            SortOrder = request.SortOrder
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Сборка оборудования добавлена",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    [HttpPut("vehicles/{vehicleId:int}/builds/{buildId:int}")]
    public async Task<IActionResult> UpdateBuild(
        [FromRoute] int vehicleId,
        [FromRoute] int buildId,
        [FromBody] AdminDirectoryBuildRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var build = await _dbContext.DirectoryBuilds
            .FirstOrDefaultAsync(
                x => x.Id == buildId && x.VehicleId == vehicleId,
                cancellationToken);

        if (build == null)
        {
            return NotFound(new
            {
                message = "Сборка не найдена"
            });
        }

        var validationError = await ValidateBuildRequestAsync(
            vehicleId,
            request,
            currentBuildId: buildId,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        build.ModeKey = request.ModeKey.Trim();
        build.StateKey = request.StateKey.Trim();
        build.Equipment1Key = request.Equipment1Key.Trim();
        build.Equipment2Key = request.Equipment2Key.Trim();
        build.Equipment3Key = request.Equipment3Key.Trim();
        build.SortOrder = request.SortOrder;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Сборка оборудования обновлена",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    [HttpDelete("vehicles/{vehicleId:int}/builds/{buildId:int}")]
    public async Task<IActionResult> DeleteBuild(
        [FromRoute] int vehicleId,
        [FromRoute] int buildId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var build = await _dbContext.DirectoryBuilds
            .FirstOrDefaultAsync(
                x => x.Id == buildId && x.VehicleId == vehicleId,
                cancellationToken);

        if (build == null)
        {
            return NotFound(new
            {
                message = "Сборка не найдена"
            });
        }

        _dbContext.DirectoryBuilds.Remove(build);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Сборка оборудования удалена",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    // ─────────────────────────────────────────────
    // Field modifications
    // ─────────────────────────────────────────────

    [HttpPost("vehicles/{vehicleId:int}/field-modifications")]
    public async Task<IActionResult> CreateFieldModification(
        [FromRoute] int vehicleId,
        [FromBody] AdminDirectoryFieldModificationRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var validationError = await ValidateFieldModificationRequestAsync(
            vehicleId,
            request,
            currentFieldModificationId: null,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        await EnsureDirectoryVehicleAsync(vehicleId, cancellationToken);

        _dbContext.DirectoryFieldModifications.Add(new DirectoryFieldModification
        {
            VehicleId = vehicleId,
            SectionKey = request.SectionKey.Trim(),
            LeftItemKey = request.LeftItemKey.Trim(),
            LeftSelected = request.LeftSelected,
            RightItemKey = request.RightItemKey.Trim(),
            RightSelected = request.RightSelected,
            SortOrder = request.SortOrder
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Полевая модернизация добавлена",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    [HttpPut("vehicles/{vehicleId:int}/field-modifications/{fieldModificationId:int}")]
    public async Task<IActionResult> UpdateFieldModification(
        [FromRoute] int vehicleId,
        [FromRoute] int fieldModificationId,
        [FromBody] AdminDirectoryFieldModificationRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var fieldModification = await _dbContext.DirectoryFieldModifications
            .FirstOrDefaultAsync(
                x => x.Id == fieldModificationId && x.VehicleId == vehicleId,
                cancellationToken);

        if (fieldModification == null)
        {
            return NotFound(new
            {
                message = "Полевая модернизация не найдена"
            });
        }

        var validationError = await ValidateFieldModificationRequestAsync(
            vehicleId,
            request,
            currentFieldModificationId: fieldModificationId,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        fieldModification.SectionKey = request.SectionKey.Trim();
        fieldModification.LeftItemKey = request.LeftItemKey.Trim();
        fieldModification.LeftSelected = request.LeftSelected;
        fieldModification.RightItemKey = request.RightItemKey.Trim();
        fieldModification.RightSelected = request.RightSelected;
        fieldModification.SortOrder = request.SortOrder;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Полевая модернизация обновлена",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    [HttpDelete("vehicles/{vehicleId:int}/field-modifications/{fieldModificationId:int}")]
    public async Task<IActionResult> DeleteFieldModification(
        [FromRoute] int vehicleId,
        [FromRoute] int fieldModificationId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var fieldModification = await _dbContext.DirectoryFieldModifications
            .FirstOrDefaultAsync(
                x => x.Id == fieldModificationId && x.VehicleId == vehicleId,
                cancellationToken);

        if (fieldModification == null)
        {
            return NotFound(new
            {
                message = "Полевая модернизация не найдена"
            });
        }

        _dbContext.DirectoryFieldModifications.Remove(fieldModification);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Полевая модернизация удалена",
            vehicle = await BuildVehicleDetailAsync(vehicleId, cancellationToken)
        });
    }

    // ─────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────

    private async Task<AdminDirectoryDictionariesResponse> BuildDictionariesAsync(
        CancellationToken cancellationToken)
    {
        var equipment = await _dbContext.DirectoryEquipmentItems
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Label)
            .Select(x => new AdminDirectoryEquipmentResponse
            {
                Key = x.Key,
                Label = x.Label,
                Tier = x.Tier,
                ImageUrl = x.ImageUrl,
                IsActive = x.IsActive,
                SortOrder = x.SortOrder,
                UsedInBuildsCount = _dbContext.DirectoryBuilds.Count(b =>
                    b.Equipment1Key == x.Key ||
                    b.Equipment2Key == x.Key ||
                    b.Equipment3Key == x.Key)
            })
            .ToListAsync(cancellationToken);

        var fieldModifications = await _dbContext.DirectoryFieldModificationItems
            .AsNoTracking()
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Label)
            .Select(x => new AdminDirectoryFieldItemResponse
            {
                Key = x.Key,
                Label = x.Label,
                ImageUrl = x.ImageUrl,
                IsActive = x.IsActive,
                SortOrder = x.SortOrder,
                UsedInFieldModificationsCount = _dbContext.DirectoryFieldModifications.Count(f =>
                    f.LeftItemKey == x.Key ||
                    f.RightItemKey == x.Key)
            })
            .ToListAsync(cancellationToken);

        return new AdminDirectoryDictionariesResponse
        {
            Equipment = equipment,
            FieldModifications = fieldModifications
        };
    }

    private async Task<AdminDirectoryVehicleDetailResponse?> BuildVehicleDetailAsync(
        int vehicleId,
        CancellationToken cancellationToken)
    {
        var vehicle = await _dbContext.Vehicles
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == vehicleId, cancellationToken);

        if (vehicle == null)
        {
            return null;
        }

        var directoryVehicle = await _dbContext.DirectoryVehicles
            .AsNoTracking()
            .Include(x => x.Builds)
            .Include(x => x.FieldModifications)
            .FirstOrDefaultAsync(x => x.VehicleId == vehicleId, cancellationToken);

        var builds = directoryVehicle?.Builds
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .Select(x => new AdminDirectoryBuildResponse
            {
                Id = x.Id,
                VehicleId = x.VehicleId,
                ModeKey = x.ModeKey,
                StateKey = x.StateKey,
                Equipment1Key = x.Equipment1Key,
                Equipment2Key = x.Equipment2Key,
                Equipment3Key = x.Equipment3Key,
                SortOrder = x.SortOrder
            })
            .ToArray() ?? [];

        var fieldModifications = directoryVehicle?.FieldModifications
            .OrderBy(x => x.SortOrder)
            .ThenBy(x => x.Id)
            .Select(x => new AdminDirectoryFieldModificationResponse
            {
                Id = x.Id,
                VehicleId = x.VehicleId,
                SectionKey = x.SectionKey,
                LeftItemKey = x.LeftItemKey,
                LeftSelected = x.LeftSelected,
                RightItemKey = x.RightItemKey,
                RightSelected = x.RightSelected,
                SortOrder = x.SortOrder
            })
            .ToArray() ?? [];

        return new AdminDirectoryVehicleDetailResponse
        {
            HasDirectory = directoryVehicle != null,
            ImageUrl = directoryVehicle?.ImageUrl,
            IsPublished = directoryVehicle?.IsPublished ?? false,
            Vehicle = ToVehicleListResponse(
                vehicle,
                directoryVehicle,
                builds.Length,
                fieldModifications.Length),
            Builds = builds,
            FieldModifications = fieldModifications
        };
    }

    private async Task EnsureDirectoryVehicleAsync(
        int vehicleId,
        CancellationToken cancellationToken)
    {
        var directoryVehicle = await _dbContext.DirectoryVehicles
            .FirstOrDefaultAsync(x => x.VehicleId == vehicleId, cancellationToken);

        if (directoryVehicle != null)
        {
            directoryVehicle.UpdatedAtUtc = DateTime.UtcNow;
            return;
        }

        var vehicleExists = await _dbContext.Vehicles
            .AnyAsync(x => x.Id == vehicleId, cancellationToken);

        if (!vehicleExists)
        {
            throw new InvalidOperationException("Техника не найдена");
        }

        _dbContext.DirectoryVehicles.Add(new DirectoryVehicle
        {
            VehicleId = vehicleId,
            ImageUrl = null,
            IsPublished = true,
            UpdatedAtUtc = DateTime.UtcNow
        });
    }

    private async Task<string?> ValidateBuildRequestAsync(
        int vehicleId,
        AdminDirectoryBuildRequest request,
        int? currentBuildId,
        CancellationToken cancellationToken)
    {
        var vehicleExists = await _dbContext.Vehicles
            .AnyAsync(x => x.Id == vehicleId, cancellationToken);

        if (!vehicleExists)
        {
            return "Техника не найдена";
        }

        var equipmentKeys = new[]
        {
            request.Equipment1Key.Trim(),
            request.Equipment2Key.Trim(),
            request.Equipment3Key.Trim()
        };

        if (equipmentKeys.Any(string.IsNullOrWhiteSpace))
        {
            return "Нужно выбрать все три оборудования";
        }

        var existingEquipmentCount = await _dbContext.DirectoryEquipmentItems
            .CountAsync(x => equipmentKeys.Contains(x.Key), cancellationToken);

        if (existingEquipmentCount != equipmentKeys.Distinct().Count())
        {
            return "Одно или несколько выбранных оборудований не найдены в справочнике";
        }

        var modeKey = request.ModeKey.Trim();
        var stateKey = request.StateKey.Trim();

        var duplicate = await _dbContext.DirectoryBuilds
            .AnyAsync(
                x => x.VehicleId == vehicleId &&
                     x.ModeKey == modeKey &&
                     x.StateKey == stateKey &&
                     (!currentBuildId.HasValue || x.Id != currentBuildId.Value),
                cancellationToken);

        if (duplicate)
        {
            return "Для этой техники уже есть сборка с таким режимом и состоянием";
        }

        return null;
    }

    private async Task<string?> ValidateFieldModificationRequestAsync(
        int vehicleId,
        AdminDirectoryFieldModificationRequest request,
        int? currentFieldModificationId,
        CancellationToken cancellationToken)
    {
        var vehicleExists = await _dbContext.Vehicles
            .AnyAsync(x => x.Id == vehicleId, cancellationToken);

        if (!vehicleExists)
        {
            return "Техника не найдена";
        }

        if (request.LeftSelected == request.RightSelected)
        {
            return "В секции полевой модернизации должен быть выбран ровно один вариант";
        }

        var itemKeys = new[]
        {
            request.LeftItemKey.Trim(),
            request.RightItemKey.Trim()
        };

        if (itemKeys.Any(string.IsNullOrWhiteSpace))
        {
            return "Нужно выбрать левый и правый вариант полевой модернизации";
        }

        var existingItemsCount = await _dbContext.DirectoryFieldModificationItems
            .CountAsync(x => itemKeys.Contains(x.Key), cancellationToken);

        if (existingItemsCount != itemKeys.Distinct().Count())
        {
            return "Один или несколько элементов полевой модернизации не найдены в справочнике";
        }

        var sectionKey = request.SectionKey.Trim();

        var duplicate = await _dbContext.DirectoryFieldModifications
            .AnyAsync(
                x => x.VehicleId == vehicleId &&
                     x.SectionKey == sectionKey &&
                     (!currentFieldModificationId.HasValue || x.Id != currentFieldModificationId.Value),
                cancellationToken);

        if (duplicate)
        {
            return "Для этой техники уже есть полевая модернизация с такой секцией";
        }

        return null;
    }

    private static AdminDirectoryVehicleListItemResponse ToVehicleListResponse(
        Vehicle vehicle,
        DirectoryVehicle? directoryVehicle,
        int buildsCount,
        int fieldModificationsCount)
    {
        return new AdminDirectoryVehicleListItemResponse
        {
            Id = vehicle.Id,
            InternalName = vehicle.InternalName,
            Nation = vehicle.Nation,
            Type = vehicle.Type,
            Tier = vehicle.Tier,
            Name = vehicle.Name,
            ShortName = vehicle.ShortName,
            Role = vehicle.Role,
            IconUrl = $"{IconsBase}/{vehicle.InternalName}.svg",
            HasDirectory = directoryVehicle != null,
            ImageUrl = directoryVehicle?.ImageUrl,
            IsPublished = directoryVehicle?.IsPublished ?? false,
            BuildsCount = buildsCount,
            FieldModificationsCount = fieldModificationsCount
        };
    }

    private async Task<bool> IsAdminAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return false;
        }

        var user = await _userManager.FindByIdAsync(userId);

        return user != null &&
               await _userManager.IsInRoleAsync(user, AppRoles.Administrator);
    }

    private static IActionResult Forbidden()
    {
        return new ObjectResult(new
        {
            message = "Доступ разрешён только администратору"
        })
        {
            StatusCode = StatusCodes.Status403Forbidden
        };
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}