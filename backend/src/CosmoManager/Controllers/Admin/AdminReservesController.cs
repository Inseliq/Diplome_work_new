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
[Route("api/admin/reserves")]
[Authorize]
public class AdminReservesController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminReservesController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetClanReserves(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var query = _dbContext.Clans
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();

            query = query.Where(x =>
                x.Tag.ToLower().Contains(normalized) ||
                x.Name.ToLower().Contains(normalized));
        }

        var clans = await query
            .OrderByDescending(x => x.EloRating)
            .ThenBy(x => x.Tag)
            .Select(x => new ClanRow(
                x.Id,
                x.Tag,
                x.Name,
                x.EloRating,
                x.Users.Count
            ))
            .Take(100)
            .ToListAsync(cancellationToken);

        var clanIds = clans.Select(x => x.Id).ToArray();

        var inventories = await _dbContext.ClanReserveInventories
            .AsNoTracking()
            .Where(x => clanIds.Contains(x.ClanId))
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        var activeReserves = await _dbContext.ClanReserveActivations
            .AsNoTracking()
            .Include(x => x.ActivatedByUser)
            .Where(x => clanIds.Contains(x.ClanId) && x.EndsAtUtc > now)
            .ToListAsync(cancellationToken);

        var response = clans
            .Select(clan => BuildClanResponse(clan, inventories, activeReserves))
            .ToList();

        return Ok(response);
    }

    [HttpGet("{clanId:int}")]
    public async Task<IActionResult> GetClanReserve(
        [FromRoute] int clanId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var response = await BuildSingleClanResponseAsync(clanId, cancellationToken);

        if (response == null)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        return Ok(response);
    }

    [HttpPut("{clanId:int}/{reserveType}/set")]
    public async Task<IActionResult> SetReserveAmount(
        [FromRoute] int clanId,
        [FromRoute] string reserveType,
        [FromBody] AdminReserveSetAmountRequest request,
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

        var definition = ClanReserveCatalog.GetByKey(reserveType);

        if (definition == null)
        {
            return BadRequest(new
            {
                message = "Такого резерва не существует"
            });
        }

        var clanExists = await _dbContext.Clans
            .AnyAsync(x => x.Id == clanId, cancellationToken);

        if (!clanExists)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var now = DateTime.UtcNow;

        var inventory = await _dbContext.ClanReserveInventories
            .FirstOrDefaultAsync(
                x => x.ClanId == clanId && x.ReserveType == definition.Type,
                cancellationToken);

        if (inventory == null)
        {
            inventory = new ClanReserveInventory
            {
                ClanId = clanId,
                ReserveType = definition.Type,
                Amount = request.Amount,
                UpdatedAtUtc = now
            };

            _dbContext.ClanReserveInventories.Add(inventory);
        }
        else
        {
            inventory.Amount = request.Amount;
            inventory.UpdatedAtUtc = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = await BuildSingleClanResponseAsync(clanId, cancellationToken);

        return Ok(new
        {
            message = "Количество резервов обновлено",
            clan = response
        });
    }

    [HttpPost("{clanId:int}/{reserveType}/adjust")]
    public async Task<IActionResult> AdjustReserveAmount(
        [FromRoute] int clanId,
        [FromRoute] string reserveType,
        [FromBody] AdminReserveAdjustAmountRequest request,
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

        var definition = ClanReserveCatalog.GetByKey(reserveType);

        if (definition == null)
        {
            return BadRequest(new
            {
                message = "Такого резерва не существует"
            });
        }

        var clanExists = await _dbContext.Clans
            .AnyAsync(x => x.Id == clanId, cancellationToken);

        if (!clanExists)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var now = DateTime.UtcNow;

        var inventory = await _dbContext.ClanReserveInventories
            .FirstOrDefaultAsync(
                x => x.ClanId == clanId && x.ReserveType == definition.Type,
                cancellationToken);

        if (inventory == null)
        {
            if (request.Delta < 0)
            {
                return BadRequest(new
                {
                    message = "Нельзя уменьшить резерв ниже 0"
                });
            }

            inventory = new ClanReserveInventory
            {
                ClanId = clanId,
                ReserveType = definition.Type,
                Amount = request.Delta,
                UpdatedAtUtc = now
            };

            _dbContext.ClanReserveInventories.Add(inventory);
        }
        else
        {
            var newAmount = inventory.Amount + request.Delta;

            if (newAmount < 0)
            {
                return BadRequest(new
                {
                    message = "Нельзя уменьшить резерв ниже 0"
                });
            }

            inventory.Amount = newAmount;
            inventory.UpdatedAtUtc = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var response = await BuildSingleClanResponseAsync(clanId, cancellationToken);

        return Ok(new
        {
            message = "Количество резервов изменено",
            clan = response
        });
    }

    [HttpDelete("{clanId:int}/{reserveType}")]
    public async Task<IActionResult> DeleteReserveInventory(
        [FromRoute] int clanId,
        [FromRoute] string reserveType,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var definition = ClanReserveCatalog.GetByKey(reserveType);

        if (definition == null)
        {
            return BadRequest(new
            {
                message = "Такого резерва не существует"
            });
        }

        var clanExists = await _dbContext.Clans
            .AnyAsync(x => x.Id == clanId, cancellationToken);

        if (!clanExists)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var inventory = await _dbContext.ClanReserveInventories
            .FirstOrDefaultAsync(
                x => x.ClanId == clanId && x.ReserveType == definition.Type,
                cancellationToken);

        if (inventory != null)
        {
            _dbContext.ClanReserveInventories.Remove(inventory);
            await _dbContext.SaveChangesAsync(cancellationToken);
        }

        var response = await BuildSingleClanResponseAsync(clanId, cancellationToken);

        return Ok(new
        {
            message = "Запас резерва обнулён",
            clan = response
        });
    }

    private async Task<AdminClanReserveResponse?> BuildSingleClanResponseAsync(
        int clanId,
        CancellationToken cancellationToken)
    {
        var clan = await _dbContext.Clans
            .AsNoTracking()
            .Where(x => x.Id == clanId)
            .Select(x => new ClanRow(
                x.Id,
                x.Tag,
                x.Name,
                x.EloRating,
                x.Users.Count
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (clan == null)
        {
            return null;
        }

        var inventories = await _dbContext.ClanReserveInventories
            .AsNoTracking()
            .Where(x => x.ClanId == clanId)
            .ToListAsync(cancellationToken);

        var now = DateTime.UtcNow;

        var activeReserves = await _dbContext.ClanReserveActivations
            .AsNoTracking()
            .Include(x => x.ActivatedByUser)
            .Where(x => x.ClanId == clanId && x.EndsAtUtc > now)
            .ToListAsync(cancellationToken);

        return BuildClanResponse(clan, inventories, activeReserves);
    }

    private static AdminClanReserveResponse BuildClanResponse(
        ClanRow clan,
        IReadOnlyCollection<ClanReserveInventory> inventories,
        IReadOnlyCollection<ClanReserveActivation> activeReserves)
    {
        var clanInventories = inventories
            .Where(x => x.ClanId == clan.Id)
            .ToDictionary(x => x.ReserveType, x => x);

        var activeByGroup = activeReserves
            .Where(x => x.ClanId == clan.Id)
            .GroupBy(x => x.ReserveGroup)
            .ToDictionary(
                x => x.Key,
                x => x.OrderByDescending(r => r.EndsAtUtc).First());

        var groups = ClanReserveCatalog.All
            .GroupBy(x => x.Group)
            .Select(group =>
            {
                var firstDefinition = group.First();

                activeByGroup.TryGetValue(group.Key, out var activeReserve);

                var activeDefinition = activeReserve == null
                    ? null
                    : ClanReserveCatalog.GetByType(activeReserve.ReserveType);

                var activeResponse = activeReserve == null || activeDefinition == null
                    ? null
                    : new AdminActiveReserveResponse
                    {
                        Id = activeReserve.Id,
                        Type = activeDefinition.TypeKey,
                        Title = activeDefinition.Title,
                        ActivatedAtUtc = activeReserve.ActivatedAtUtc,
                        EndsAtUtc = activeReserve.EndsAtUtc,
                        ActivatedByNickname = activeReserve.ActivatedByUser?.Nickname ?? "Неизвестно"
                    };

                var reserves = group.Select(definition =>
                {
                    clanInventories.TryGetValue(definition.Type, out var inventory);

                    return new AdminReserveItemResponse
                    {
                        Type = definition.TypeKey,
                        Group = definition.GroupKey,
                        Title = definition.Title,
                        Description = definition.Description,
                        BonusText = definition.BonusText,
                        ImageUrl = definition.ImageUrl,
                        Stock = inventory?.Amount ?? 0,
                        UpdatedAtUtc = inventory?.UpdatedAtUtc
                    };
                }).ToArray();

                return new AdminReserveGroupResponse
                {
                    Key = firstDefinition.GroupKey,
                    Title = firstDefinition.GroupTitle,
                    ActiveReserve = activeResponse,
                    Reserves = reserves
                };
            })
            .ToArray();

        return new AdminClanReserveResponse
        {
            Id = clan.Id,
            Tag = clan.Tag,
            Name = clan.Name,
            EloRating = clan.EloRating,
            MembersCount = clan.MembersCount,
            Groups = groups
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

    private sealed record ClanRow(
        int Id,
        string Tag,
        string Name,
        int EloRating,
        int MembersCount
    );
}