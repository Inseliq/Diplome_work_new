using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests.Profile;
using CosmoManager.Responses.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private static readonly Regex NicknameRegex = new(
        "^[A-Za-z0-9_]{3,24}$",
        RegexOptions.Compiled);

    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public ProfileController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        var roles = await _userManager.GetRolesAsync(user);

        var culture = CultureInfo.GetCultureInfo("ru-RU");
        var nickname = user.Nickname;

        var registrationRows = await _dbContext.TournamentRegistrations
            .AsNoTracking()
            .Where(x => x.AppUserId == user.Id)
            .OrderByDescending(x => x.RegisteredAtUtc)
            .Select(x => new
            {
                RegistrationId = x.Id,
                TournamentId = x.TournamentId,
                TournamentName = x.Tournament.Name,
                TournamentStatus = x.Tournament.Status,
                TeamName = x.TeamName,
                Format = x.Tournament.Format,
                Tier = x.Tournament.Tier,
                RegisteredAtUtc = x.RegisteredAtUtc
            })
            .ToListAsync(cancellationToken);

        var registrations = registrationRows
            .Select(x => new ProfileTournamentResponse
            {
                RegistrationId = x.RegistrationId,
                TournamentId = x.TournamentId,
                TournamentName = x.TournamentName,
                TournamentStatus = x.TournamentStatus,
                TeamName = !string.IsNullOrWhiteSpace(x.TeamName)
                    ? x.TeamName
                    : nickname,
                Format = x.Format,
                Tier = x.Tier,
                RegisteredAtUtc = x.RegisteredAtUtc,
                RegisteredAt = x.RegisteredAtUtc.ToString(
                    "d MMMM yyyy HH:mm",
                    culture)
            })
            .ToList();

        var response = new ProfileResponse
        {
            Id = user.Id,
            Nickname = user.Nickname,
            Email = user.Email ?? string.Empty,
            Clan = user.Clan == null
                ? null
                : new ProfileClanResponse
                {
                    Id = user.Clan.Id,
                    Tag = user.Clan.Tag,
                    Name = user.Clan.Name
                },
            ClanRank = user.ClanRank?.ToString(),
            ClanRankLabel = user.ClanRank.HasValue
                ? ClanRankHelper.GetLabel(user.ClanRank.Value)
                : null,
            Roles = roles.ToArray(),
            Tournaments = registrations
        };

        return Ok(response);
    }

    [HttpPut("nickname")]
    public async Task<IActionResult> UpdateNickname(
        [FromBody] UpdateNicknameRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        var nickname = request.Nickname.Trim();

        if (!NicknameRegex.IsMatch(nickname))
        {
            return BadRequest(new
            {
                message = "Никнейм должен быть от 3 до 24 символов и может содержать только A-Z, a-z, 0-9 и _."
            });
        }

        var existingUser = await _userManager.FindByNameAsync(nickname);

        if (existingUser != null && existingUser.Id != user.Id)
        {
            return BadRequest(new
            {
                message = "Пользователь с таким никнеймом уже существует"
            });
        }

        user.Nickname = nickname;
        user.UserName = nickname;
        user.NormalizedUserName = _userManager.NormalizeName(nickname);

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Не удалось обновить никнейм",
                errors = result.Errors.Select(x => x.Description).ToArray()
            });
        }

        return Ok(new
        {
            message = "Никнейм успешно обновлён",
            nickname = user.Nickname
        });
    }

    [HttpPut("email")]
    public async Task<IActionResult> UpdateEmail(
        [FromBody] UpdateEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        var email = request.Email.Trim();

        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser != null && existingUser.Id != user.Id)
        {
            return BadRequest(new
            {
                message = "Пользователь с такой почтой уже существует"
            });
        }

        user.Email = email;
        user.NormalizedEmail = _userManager.NormalizeEmail(email);
        user.EmailConfirmed = false;

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Не удалось обновить почту",
                errors = result.Errors.Select(x => x.Description).ToArray()
            });
        }

        return Ok(new
        {
            message = "Почта успешно обновлена",
            email = user.Email
        });
    }

    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Не удалось изменить пароль",
                errors = result.Errors.Select(x => x.Description).ToArray()
            });
        }

        return Ok(new
        {
            message = "Пароль успешно изменён"
        });
    }

    [HttpPost("leave-clan")]
    public async Task<IActionResult> LeaveClan(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        if (user.ClanId == null)
        {
            return BadRequest(new
            {
                message = "Вы пока не состоите в клане"
            });
        }

        if (user.ClanRank == ClanRank.Commander)
        {
            return BadRequest(new
            {
                message = "Командующий не может покинуть клан. Сначала передайте звание другому участнику через админку."
            });
        }

        var oldRank = user.ClanRank;

        user.ClanId = null;
        user.ClanRank = null;

        if (oldRank.HasValue &&
            ClanRankHelper.GivesModeratorRole(oldRank.Value) &&
            !await _userManager.IsInRoleAsync(user, AppRoles.Administrator))
        {
            if (await _userManager.IsInRoleAsync(user, AppRoles.Moderator))
            {
                await _userManager.RemoveFromRoleAsync(user, AppRoles.Moderator);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Вы покинули клан"
        });
    }

    [HttpGet("my-clan")]
    public async Task<IActionResult> GetMyClan(CancellationToken cancellationToken)
    {
        var user = await GetCurrentUserAsync(cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        if (user.ClanId == null)
        {
            return NotFound(new
            {
                code = "ClanRequired",
                message = "Вы пока не состоите в клане"
            });
        }

        var clan = await _dbContext.Clans
            .AsNoTracking()
            .Where(x => x.Id == user.ClanId)
            .Select(x => new MyClanResponse
            {
                Id = x.Id,
                Tag = x.Tag,
                Name = x.Name,
                Description = x.Description,
                EloRating = x.EloRating,
                MembersCount = x.Users.Count,
                Members = x.Users
                    .OrderByDescending(member => member.ClanRank)
                    .ThenBy(member => member.Nickname)
                    .Select(member => new MyClanMemberResponse
                    {
                        Id = member.Id,
                        Nickname = member.Nickname,
                        Rank = member.ClanRank.HasValue
                            ? member.ClanRank.Value.ToString()
                            : string.Empty,
                        RankLabel = member.ClanRank.HasValue
                            ? ClanRankHelper.GetLabel(member.ClanRank.Value)
                            : "Без звания",
                        IsCurrentUser = member.Id == user.Id
                    })
                    .ToArray()
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (clan == null)
        {
            return NotFound(new
            {
                code = "ClanNotFound",
                message = "Клан не найден"
            });
        }

        return Ok(clan);
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
}