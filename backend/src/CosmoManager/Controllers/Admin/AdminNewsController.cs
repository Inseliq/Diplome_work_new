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
[Route("api/admin/news")]
[Authorize]
public class AdminNewsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminNewsController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetNews(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var items = await _dbContext.InfoItems
            .AsNoTracking()
            .Where(x => x.Type == InfoItemType.News)
            .OrderByDescending(x => x.DateStart)
            .ThenByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(items.Select(ToResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetNewsById(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var item = await _dbContext.InfoItems
            .AsNoTracking()
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Type == InfoItemType.News,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Новость не найдена"
            });
        }

        return Ok(ToResponse(item));
    }

    [HttpPost]
    public async Task<IActionResult> CreateNews(
        [FromBody] AdminNewsRequest request,
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

        var item = new InfoItem
        {
            Type = InfoItemType.News,
            Title = request.Title.Trim(),
            Category = request.Category.Trim(),
            Status = null,
            DateStart = request.DateStart.Date,
            DateEnd = null,
            ImageUrl = NormalizeNullable(request.ImageUrl),
            Gradient = NormalizeNullable(request.Gradient),
            Excerpt = NormalizeNullable(request.Excerpt),
            Content = NormalizeNullable(request.Content),
            IsPublished = request.IsPublished,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.InfoItems.Add(item);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Новость успешно создана",
            news = ToResponse(item)
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateNews(
        [FromRoute] int id,
        [FromBody] AdminNewsRequest request,
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

        var item = await _dbContext.InfoItems
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Type == InfoItemType.News,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Новость не найдена"
            });
        }

        item.Title = request.Title.Trim();
        item.Category = request.Category.Trim();
        item.DateStart = request.DateStart.Date;
        item.ImageUrl = NormalizeNullable(request.ImageUrl);
        item.Gradient = NormalizeNullable(request.Gradient);
        item.Excerpt = NormalizeNullable(request.Excerpt);
        item.Content = NormalizeNullable(request.Content);
        item.IsPublished = request.IsPublished;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Новость успешно обновлена",
            news = ToResponse(item)
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

        var item = await _dbContext.InfoItems
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Type == InfoItemType.News,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Новость не найдена"
            });
        }

        item.IsPublished = value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = value
                ? "Новость опубликована"
                : "Новость снята с публикации"
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNews(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var item = await _dbContext.InfoItems
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Type == InfoItemType.News,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Новость не найдена"
            });
        }

        _dbContext.InfoItems.Remove(item);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Новость удалена"
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

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static AdminNewsResponse ToResponse(InfoItem item)
    {
        var culture = CultureInfo.GetCultureInfo("ru-RU");

        return new AdminNewsResponse
        {
            Id = item.Id,
            Title = item.Title,
            Category = item.Category,
            Date = item.DateStart.ToString("d MMMM yyyy", culture),
            DateISO = item.DateStart.ToString("yyyy-MM-dd"),
            ImageUrl = item.ImageUrl,
            Gradient = item.Gradient,
            Excerpt = item.Excerpt,
            Content = item.Content,
            IsPublished = item.IsPublished,
            CreatedAtUtc = item.CreatedAtUtc,
            CreatedAt = item.CreatedAtUtc.ToString("d MMMM yyyy HH:mm", culture)
        };
    }
}