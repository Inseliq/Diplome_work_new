using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/clan/reserves")]
[Authorize]
public class ClanReservesController : ControllerBase
{
    private static readonly TimeSpan ReserveDuration = TimeSpan.FromHours(2);

    private readonly AppDbContext _dbContext;

    public ClanReservesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetState(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized();
        }

        var accessError = GetReserveAccessError(user);

        if (accessError != null)
        {
            return StatusCode(StatusCodes.Status403Forbidden, accessError);
        }

        var response = await BuildStateResponseAsync(user, cancellationToken);

        return Ok(response);
    }

    [HttpPost("activate/{reserveType}")]
    public async Task<IActionResult> ActivateReserve(
        [FromRoute] string reserveType,
        CancellationToken cancellationToken)
    {
        var definition = ClanReserveCatalog.GetByKey(reserveType);

        if (definition == null)
        {
            return BadRequest(new
            {
                message = "Такого резерва не существует"
            });
        }

        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized();
        }

        var accessError = GetReserveAccessError(user);

        if (accessError != null)
        {
            return StatusCode(StatusCodes.Status403Forbidden, accessError);
        }

        if (!CanActivateReserves())
        {
            return Forbid();
        }

        var clanId = user.ClanId!.Value;
        var now = DateTime.UtcNow;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(
            IsolationLevel.Serializable,
            cancellationToken);

        var activeInGroup = await _dbContext.ClanReserveActivations
            .Where(x =>
                x.ClanId == clanId &&
                x.ReserveGroup == definition.Group &&
                x.EndsAtUtc > now)
            .OrderByDescending(x => x.EndsAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeInGroup != null)
        {
            return BadRequest(new
            {
                message = "В этой группе уже активирован другой резерв"
            });
        }

        var inventory = await _dbContext.ClanReserveInventories
            .FirstOrDefaultAsync(
                x => x.ClanId == clanId && x.ReserveType == definition.Type,
                cancellationToken);

        if (inventory == null || inventory.Amount <= 0)
        {
            return BadRequest(new
            {
                message = "Резерва нет на складе"
            });
        }

        inventory.Amount -= 1;
        inventory.UpdatedAtUtc = now;

        var activation = new ClanReserveActivation
        {
            ClanId = clanId,
            ReserveType = definition.Type,
            ReserveGroup = definition.Group,
            ActivatedByUserId = user.Id,
            ActivatedAtUtc = now,
            EndsAtUtc = now.Add(ReserveDuration)
        };

        _dbContext.ClanReserveActivations.Add(activation);

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        var response = await BuildStateResponseAsync(user, cancellationToken);

        return Ok(response);
    }

    private static object? GetReserveAccessError(AppUser user)
    {
        if (user.ClanId == null)
        {
            return new
            {
                code = "ClanRequired",
                message = "Для доступа к клановым резервам сначала вступите в клан."
            };
        }

        if (!user.ClanRank.HasValue)
        {
            return new
            {
                code = "RankRequired",
                message = "Для доступа к клановым резервам необходимо иметь звание в клане."
            };
        }

        if (user.ClanRank.Value == ClanRank.Reservist)
        {
            return new
            {
                code = "RankTooLow",
                message = "Резервисты не могут просматривать и активировать клановые резервы."
            };
        }

        return null;
    }

    private async Task<AppUser?> GetCurrentUserAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await _dbContext.Users
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);
    }

    private bool CanActivateReserves()
    {
        return User.IsInRole(AppRoles.Administrator) ||
               User.IsInRole(AppRoles.Moderator);
    }

    private async Task<ClanReserveStateResponse> BuildStateResponseAsync(
        AppUser user,
        CancellationToken cancellationToken)
    {
        var clanId = user.ClanId!.Value;
        var now = DateTime.UtcNow;
        var canManage = CanActivateReserves();

        var inventories = await _dbContext.ClanReserveInventories
            .AsNoTracking()
            .Where(x => x.ClanId == clanId)
            .ToDictionaryAsync(x => x.ReserveType, cancellationToken);

        var activeReserves = await _dbContext.ClanReserveActivations
            .AsNoTracking()
            .Include(x => x.ActivatedByUser)
            .Where(x => x.ClanId == clanId && x.EndsAtUtc > now)
            .ToListAsync(cancellationToken);

        var activeByGroup = activeReserves
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
                    : new ClanActiveReserveResponse(
                        Type: activeDefinition.TypeKey,
                        Title: activeDefinition.Title,
                        ActivatedAtUtc: activeReserve.ActivatedAtUtc,
                        EndsAtUtc: activeReserve.EndsAtUtc,
                        ActivatedByNickname: activeReserve.ActivatedByUser?.Nickname ?? "Неизвестно"
                    );

                var reserves = group.Select(definition =>
                {
                    var stock = inventories.TryGetValue(definition.Type, out var inventory)
                        ? inventory.Amount
                        : 0;

                    var isActive = activeReserve?.ReserveType == definition.Type;
                    var hasActiveInGroup = activeReserve != null;

                    var canActivate =
                        canManage &&
                        stock > 0 &&
                        !hasActiveInGroup;

                    var statusText = GetStatusText(
                        stock,
                        isActive,
                        hasActiveInGroup,
                        canManage);

                    return new ClanReserveItemResponse(
                        Type: definition.TypeKey,
                        Group: definition.GroupKey,
                        Title: definition.Title,
                        Description: definition.Description,
                        BonusText: definition.BonusText,
                        ImageUrl: definition.ImageUrl,
                        Stock: stock,
                        IsActive: isActive,
                        CanActivate: canActivate,
                        StatusText: statusText,
                        EndsAtUtc: isActive ? activeReserve?.EndsAtUtc : null
                    );
                }).ToArray();

                return new ClanReserveGroupResponse(
                    Key: firstDefinition.GroupKey,
                    Title: firstDefinition.GroupTitle,
                    ActiveReserve: activeResponse,
                    Reserves: reserves
                );
            })
            .ToArray();

        return new ClanReserveStateResponse(
            CanActivateReserves: canManage,
            ServerTimeUtc: now,
            Groups: groups
        );
    }

    private static string GetStatusText(
        int stock,
        bool isActive,
        bool hasActiveInGroup,
        bool canManage)
    {
        if (isActive)
        {
            return "Активирован";
        }

        if (hasActiveInGroup)
        {
            return "В группе уже активирован другой резерв";
        }

        if (stock <= 0)
        {
            return "Нет на складе";
        }

        return canManage
            ? "Можно активировать"
            : "Готов к активации";
    }
}