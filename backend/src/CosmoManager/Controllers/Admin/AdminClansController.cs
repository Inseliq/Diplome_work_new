using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers.Admin;

[ApiController]
[Route("api/admin/clans")]
[Authorize]
public class AdminClansController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminClansController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetClans(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var clans = await _dbContext.Clans
            .AsNoTracking()
            .OrderByDescending(x => x.EloRating)
            .ThenBy(x => x.Tag)
            .Select(x => new ClanResponse(
                x.Id,
                x.Tag,
                x.Name,
                x.Description,
                x.EloRating,
                x.Users.Count,
                x.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Ok(clans);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetClan(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var clan = await _dbContext.Clans
            .AsNoTracking()
            .Include(x => x.Users)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (clan == null)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var players = new List<ClanUserResponse>();

        foreach (var user in clan.Users
                     .OrderByDescending(x => x.ClanRank)
                     .ThenBy(x => x.Nickname))
        {
            var roles = await _userManager.GetRolesAsync(user);

            players.Add(new ClanUserResponse(
                user.Id,
                user.Nickname,
                user.Email,
                user.ClanRank.HasValue ? user.ClanRank.Value.ToString() : string.Empty,
                user.ClanRank.HasValue ? ClanRankHelper.GetLabel(user.ClanRank.Value) : "Без звания",
                roles.ToArray()
            ));
        }

        var response = new ClanDetailsResponse(
            clan.Id,
            clan.Tag,
            clan.Name,
            clan.Description,
            clan.EloRating,
            clan.Users.Count,
            clan.CreatedAtUtc,
            players
        );

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> CreateClan(
        [FromBody] UpdateClanRequest request,
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

        var tag = request.Tag.Trim();

        var tagExists = await _dbContext.Clans
            .AnyAsync(x => x.Tag == tag, cancellationToken);

        if (tagExists)
        {
            return BadRequest(new
            {
                message = "Клан с таким тегом уже существует"
            });
        }

        var clan = new Clan
        {
            Tag = tag,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            EloRating = request.EloRating,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Clans.Add(clan);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Клан успешно создан",
            clan = new ClanResponse(
                clan.Id,
                clan.Tag,
                clan.Name,
                clan.Description,
                clan.EloRating,
                0,
                clan.CreatedAtUtc
            )
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateClan(
        [FromRoute] int id,
        [FromBody] UpdateClanRequest request,
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

        var clan = await _dbContext.Clans
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (clan == null)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var tag = request.Tag.Trim();

        var tagBusy = await _dbContext.Clans
            .AnyAsync(x => x.Tag == tag && x.Id != id, cancellationToken);

        if (tagBusy)
        {
            return BadRequest(new
            {
                message = "Клан с таким тегом уже существует"
            });
        }

        clan.Tag = tag;
        clan.Name = request.Name.Trim();
        clan.Description = request.Description.Trim();
        clan.EloRating = request.EloRating;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Клан успешно обновлён"
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteClan(
    [FromRoute] int id,
    CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var clan = await _dbContext.Clans
            .Include(x => x.Users)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (clan == null)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var users = clan.Users.ToList();

        foreach (var user in users)
        {
            var oldRank = user.ClanRank;

            user.ClanId = null;
            user.ClanRank = null;

            await SyncModeratorRoleAsync(user, oldRank, null);
        }

        _dbContext.Clans.Remove(clan);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Клан успешно удалён"
        });
    }

    [HttpDelete("{clanId:int}/players/{userId}")]
    public async Task<IActionResult> RemovePlayerFromClan(
        [FromRoute] int clanId,
        [FromRoute] string userId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        if (user.ClanId != clanId)
        {
            return BadRequest(new
            {
                message = "Пользователь не состоит в этом клане"
            });
        }

        var oldRank = user.ClanRank;

        user.ClanId = null;
        user.ClanRank = null;

        await SyncModeratorRoleAsync(user, oldRank, null);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Пользователь исключён из клана"
        });
    }

    [HttpPut("{clanId:int}/players/rank")]
    public async Task<IActionResult> UpdatePlayerRank(
        [FromRoute] int clanId,
        [FromBody] UpdateUserClanRankRequest request,
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

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        if (user.ClanId != clanId)
        {
            return BadRequest(new
            {
                message = "Пользователь не состоит в этом клане"
            });
        }

        if (request.Rank == ClanRank.Commander)
        {
            var commanderExists = await _dbContext.Users
                .AnyAsync(
                    x => x.ClanId == clanId &&
                         x.Id != user.Id &&
                         x.ClanRank == ClanRank.Commander,
                    cancellationToken);

            if (commanderExists)
            {
                return BadRequest(new
                {
                    message = "В клане уже есть командующий"
                });
            }
        }

        var oldRank = user.ClanRank;

        user.ClanRank = request.Rank;

        await SyncModeratorRoleAsync(user, oldRank, request.Rank);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Звание пользователя обновлено"
        });
    }

    [HttpGet("ranks")]
    public IActionResult GetRanks()
    {
        var ranks = Enum.GetValues<ClanRank>()
            .Select(x => new
            {
                value = (int)x,
                key = x.ToString(),
                label = ClanRankHelper.GetLabel(x)
            })
            .ToArray();

        return Ok(ranks);
    }

    private async Task SyncModeratorRoleAsync(
        AppUser user,
        ClanRank? oldRank,
        ClanRank? newRank)
    {
        var isAdmin = await _userManager.IsInRoleAsync(user, AppRoles.Administrator);

        if (isAdmin)
        {
            return;
        }

        var oldGaveModerator = ClanRankHelper.GivesModeratorRole(oldRank);
        var newGivesModerator = ClanRankHelper.GivesModeratorRole(newRank);

        if (newGivesModerator)
        {
            if (!await _userManager.IsInRoleAsync(user, AppRoles.Moderator))
            {
                await _userManager.AddToRoleAsync(user, AppRoles.Moderator);
            }

            return;
        }

        if (oldGaveModerator && await _userManager.IsInRoleAsync(user, AppRoles.Moderator))
        {
            await _userManager.RemoveFromRoleAsync(user, AppRoles.Moderator);
        }
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
}