using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests.Admin;
using CosmoManager.Responses;
using CosmoManager.Responses.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers.Admin;

[ApiController]
[Route("api/admin/users")]
[Authorize]
public class AdminUsersController : ControllerBase
{
    private static readonly Regex NicknameRegex = new(
        "^[A-Za-z0-9_]{3,24}$",
        RegexOptions.Compiled);

    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminUsersController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var query = _dbContext.Users
            .AsNoTracking()
            .Include(x => x.Clan)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();

            query = query.Where(x =>
                x.Nickname.ToLower().Contains(normalized) ||
                (x.Email != null && x.Email.ToLower().Contains(normalized)));
        }

        var users = await query
            .OrderBy(x => x.Nickname)
            .Take(50)
            .ToListAsync(cancellationToken);

        var response = new List<AdminUserResponse>();

        foreach (var user in users)
        {
            response.Add(await ToResponseAsync(user));
        }

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var user = await _dbContext.Users
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        return Ok(await ToResponseAsync(user));
    }

    [HttpPut("{id}/profile")]
    public async Task<IActionResult> UpdateProfile(
        [FromRoute] string id,
        [FromBody] AdminUpdateUserProfileRequest request,
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
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        var nickname = request.Nickname.Trim();
        var email = request.Email.Trim();

        if (!NicknameRegex.IsMatch(nickname))
        {
            return BadRequest(new
            {
                message = "Никнейм должен быть от 3 до 24 символов и может содержать только A-Z, a-z, 0-9 и _."
            });
        }

        var userWithSameNickname = await _userManager.FindByNameAsync(nickname);

        if (userWithSameNickname != null && userWithSameNickname.Id != user.Id)
        {
            return BadRequest(new
            {
                message = "Пользователь с таким никнеймом уже существует"
            });
        }

        var userWithSameEmail = await _userManager.FindByEmailAsync(email);

        if (userWithSameEmail != null && userWithSameEmail.Id != user.Id)
        {
            return BadRequest(new
            {
                message = "Пользователь с такой почтой уже существует"
            });
        }

        user.Nickname = nickname;
        user.UserName = nickname;
        user.NormalizedUserName = _userManager.NormalizeName(nickname);

        user.Email = email;
        user.NormalizedEmail = _userManager.NormalizeEmail(email);
        user.EmailConfirmed = false;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Не удалось обновить пользователя",
                errors = result.Errors.Select(x => x.Description).ToArray()
            });
        }

        return Ok(new
        {
            message = "Пользователь успешно обновлён",
            user = await ToResponseAsync(user)
        });
    }

    [HttpPut("{id}/clan")]
    public async Task<IActionResult> SetClan(
        [FromRoute] string id,
        [FromBody] AdminSetUserClanRequest request,
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
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        var clan = await _dbContext.Clans
            .FirstOrDefaultAsync(x => x.Id == request.ClanId, cancellationToken);

        if (clan == null)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var isNewClanForUser = user.ClanId != request.ClanId;

        if (isNewClanForUser)
        {
            var membersCount = await _dbContext.Users
                .CountAsync(x => x.ClanId == request.ClanId, cancellationToken);

            if (membersCount >= 100)
            {
                return BadRequest(new
                {
                    message = "В клане уже 100 участников"
                });
            }
        }

        if (request.Rank == ClanRank.Commander)
        {
            var commanderExists = await _dbContext.Users
                .AnyAsync(
                    x => x.ClanId == request.ClanId &&
                         x.Id != user.Id &&
                         x.ClanRank == ClanRank.Commander,
                    cancellationToken);

            if (commanderExists)
            {
                return BadRequest(new
                {
                    message = "В этом клане уже есть командующий"
                });
            }
        }

        var oldRank = user.ClanRank;

        user.ClanId = clan.Id;
        user.Clan = clan;
        user.ClanRank = request.Rank;

        await SyncModeratorRoleAsync(user, oldRank, request.Rank);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Клан пользователя обновлён",
            user = await ToResponseAsync(user)
        });
    }

    [HttpDelete("{id}/clan")]
    public async Task<IActionResult> RemoveFromClan(
        [FromRoute] string id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var user = await _dbContext.Users
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        if (user.ClanId == null)
        {
            return BadRequest(new
            {
                message = "Пользователь не состоит в клане"
            });
        }

        var oldRank = user.ClanRank;

        user.ClanId = null;
        user.Clan = null;
        user.ClanRank = null;

        await SyncModeratorRoleAsync(user, oldRank, null);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Пользователь удалён из клана",
            user = await ToResponseAsync(user)
        });
    }

    [HttpPut("{id}/clan-rank")]
    public async Task<IActionResult> UpdateClanRank(
        [FromRoute] string id,
        [FromBody] AdminUpdateUserClanRankRequest request,
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
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        if (user.ClanId == null)
        {
            return BadRequest(new
            {
                message = "Пользователь не состоит в клане"
            });
        }

        if (request.Rank == ClanRank.Commander)
        {
            var commanderExists = await _dbContext.Users
                .AnyAsync(
                    x => x.ClanId == user.ClanId &&
                         x.Id != user.Id &&
                         x.ClanRank == ClanRank.Commander,
                    cancellationToken);

            if (commanderExists)
            {
                return BadRequest(new
                {
                    message = "В этом клане уже есть командующий"
                });
            }
        }

        var oldRank = user.ClanRank;

        user.ClanRank = request.Rank;

        await SyncModeratorRoleAsync(user, oldRank, request.Rank);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Звание пользователя обновлено",
            user = await ToResponseAsync(user)
        });
    }

    [HttpPut("{id}/administrator")]
    public async Task<IActionResult> SetAdministratorRole(
        [FromRoute] string id,
        [FromQuery] bool value,
        CancellationToken cancellationToken)
    {
        var currentAdmin = await GetCurrentAdminAsync(cancellationToken);

        if (currentAdmin == null)
        {
            return Forbidden();
        }

        var user = await _dbContext.Users
            .Include(x => x.Clan)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (user == null)
        {
            return NotFound(new
            {
                message = "Пользователь не найден"
            });
        }

        if (!value && user.Id == currentAdmin.Id)
        {
            return BadRequest(new
            {
                message = "Нельзя снять права администратора с самого себя"
            });
        }

        var isAdministrator = await _userManager.IsInRoleAsync(user, AppRoles.Administrator);

        if (value && !isAdministrator)
        {
            var addResult = await _userManager.AddToRoleAsync(user, AppRoles.Administrator);

            if (!addResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Не удалось выдать права администратора",
                    errors = addResult.Errors.Select(x => x.Description).ToArray()
                });
            }
        }

        if (!value && isAdministrator)
        {
            var removeResult = await _userManager.RemoveFromRoleAsync(user, AppRoles.Administrator);

            if (!removeResult.Succeeded)
            {
                return BadRequest(new
                {
                    message = "Не удалось снять права администратора",
                    errors = removeResult.Errors.Select(x => x.Description).ToArray()
                });
            }
        }

        return Ok(new
        {
            message = value
                ? "Права администратора выданы"
                : "Права администратора сняты",
            user = await ToResponseAsync(user)
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
        var isAdministrator = await _userManager.IsInRoleAsync(user, AppRoles.Administrator);

        if (isAdministrator)
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

    private async Task<AdminUserResponse> ToResponseAsync(AppUser user)
    {
        var roles = await _userManager.GetRolesAsync(user);

        ClanShortResponse? clan = null;

        if (user.Clan != null)
        {
            clan = new ClanShortResponse(
                user.Clan.Id,
                user.Clan.Tag,
                user.Clan.Name
            );
        }

        return new AdminUserResponse
        {
            Id = user.Id,
            Nickname = user.Nickname,
            Email = user.Email ?? string.Empty,
            Clan = clan,
            ClanRank = user.ClanRank?.ToString(),
            ClanRankLabel = user.ClanRank.HasValue
                ? ClanRankHelper.GetLabel(user.ClanRank.Value)
                : null,
            Roles = roles.ToArray(),
            IsAdministrator = roles.Contains(AppRoles.Administrator),
            IsModerator = roles.Contains(AppRoles.Moderator)
        };
    }

    private async Task<AppUser?> GetCurrentAdminAsync(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user == null)
        {
            return null;
        }

        return await _userManager.IsInRoleAsync(user, AppRoles.Administrator)
            ? user
            : null;
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