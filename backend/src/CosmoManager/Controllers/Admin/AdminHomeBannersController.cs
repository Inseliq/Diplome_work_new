using System.Globalization;
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
[Route("api/admin/home-banners")]
[Authorize]
public class AdminHomeBannersController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminHomeBannersController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetBanners(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var banners = await _dbContext.HomeBanners
            .AsNoTracking()
            .OrderBy(x => x.Slot)
            .ToListAsync(cancellationToken);

        return Ok(banners.Select(ToResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetBannerById(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var banner = await _dbContext.HomeBanners
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (banner == null)
        {
            return NotFound(new
            {
                message = "Баннер не найден"
            });
        }

        return Ok(ToResponse(banner));
    }

    [HttpPost]
    public async Task<IActionResult> CreateBanner(
    [FromBody] AdminHomeBannerRequest request,
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

        if (!IsValidSlot(request.Slot))
        {
            return BadRequest(new
            {
                message = "Позиция баннера может быть только 1 или 2"
            });
        }

        var banner = new HomeBanner
        {
            Slot = request.Slot,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            ButtonLabel = NormalizeNullable(request.ButtonLabel),
            ButtonUrl = NormalizeNullable(request.ButtonUrl),
            ImageUrl = NormalizeNullable(request.ImageUrl),
            Gradient = NormalizeNullable(request.Gradient),
            IsPublished = request.IsPublished,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = null
        };

        _dbContext.HomeBanners.Add(banner);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Баннер успешно создан",
            banner = ToResponse(banner)
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBanner(
    [FromRoute] int id,
    [FromBody] AdminHomeBannerRequest request,
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

        if (!IsValidSlot(request.Slot))
        {
            return BadRequest(new
            {
                message = "Позиция баннера может быть только 1 или 2"
            });
        }

        var banner = await _dbContext.HomeBanners
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (banner == null)
        {
            return NotFound(new
            {
                message = "Баннер не найден"
            });
        }

        banner.Slot = request.Slot;
        banner.Title = request.Title.Trim();
        banner.Description = request.Description.Trim();
        banner.ButtonLabel = NormalizeNullable(request.ButtonLabel);
        banner.ButtonUrl = NormalizeNullable(request.ButtonUrl);
        banner.ImageUrl = NormalizeNullable(request.ImageUrl);
        banner.Gradient = NormalizeNullable(request.Gradient);
        banner.IsPublished = request.IsPublished;
        banner.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Баннер успешно обновлён",
            banner = ToResponse(banner)
        });
    }

    [HttpPut("{id:int}/publish")]
    public async Task<IActionResult> SetPublished(
        [FromRoute] int id,
        [FromQuery] bool value,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var banner = await _dbContext.HomeBanners
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (banner == null)
        {
            return NotFound(new
            {
                message = "Баннер не найден"
            });
        }

        banner.IsPublished = value;
        banner.UpdatedAtUtc = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = value
                ? "Баннер опубликован"
                : "Баннер снят с публикации"
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBanner(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var banner = await _dbContext.HomeBanners
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (banner == null)
        {
            return NotFound(new
            {
                message = "Баннер не найден"
            });
        }

        _dbContext.HomeBanners.Remove(banner);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Баннер удалён"
        });
    }

    [HttpDelete("slot/{slot:int}")]
    public async Task<IActionResult> DeleteBannersBySlot(
    [FromRoute] int slot,
    CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        if (!IsValidSlot(slot))
        {
            return BadRequest(new
            {
                message = "Позиция баннера может быть только 1 или 2"
            });
        }

        var banners = await _dbContext.HomeBanners
            .Where(x => x.Slot == slot)
            .ToListAsync(cancellationToken);

        if (banners.Count == 0)
        {
            return NotFound(new
            {
                message = "В этой позиции баннеров нет"
            });
        }

        _dbContext.HomeBanners.RemoveRange(banners);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = $"Все баннеры позиции {slot} удалены"
        });
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

    private static bool IsValidSlot(int slot)
    {
        return slot is 1 or 2;
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static AdminHomeBannerResponse ToResponse(HomeBanner banner)
    {
        var culture = CultureInfo.GetCultureInfo("ru-RU");

        return new AdminHomeBannerResponse
        {
            Id = banner.Id,
            Slot = banner.Slot,
            SlotLabel = banner.Slot == 1
                ? "Первый баннер"
                : "Второй баннер",
            Title = banner.Title,
            Description = banner.Description,
            ButtonLabel = banner.ButtonLabel,
            ButtonUrl = banner.ButtonUrl,
            ImageUrl = banner.ImageUrl,
            Gradient = banner.Gradient,
            IsPublished = banner.IsPublished,
            CreatedAtUtc = banner.CreatedAtUtc,
            UpdatedAtUtc = banner.UpdatedAtUtc,
            CreatedAt = banner.CreatedAtUtc.ToString("d MMMM yyyy HH:mm", culture),
            UpdatedAt = banner.UpdatedAtUtc.HasValue
                ? banner.UpdatedAtUtc.Value.ToString("d MMMM yyyy HH:mm", culture)
                : null
        };
    }
}