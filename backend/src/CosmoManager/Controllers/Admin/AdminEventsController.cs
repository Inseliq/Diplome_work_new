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
[Route("api/admin/events")]
[Authorize]
public class AdminEventsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminEventsController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetEvents(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var items = await _dbContext.InfoItems
            .AsNoTracking()
            .Where(x => x.Type == InfoItemType.Event)
            .OrderByDescending(x => x.DateStart)
            .ThenByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        return Ok(items.Select(ToResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetEventById(
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
                x => x.Id == id && x.Type == InfoItemType.Event,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Событие не найдено"
            });
        }

        return Ok(ToResponse(item));
    }

    [HttpPost]
    public async Task<IActionResult> CreateEvent(
        [FromBody] AdminEventRequest request,
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

        var validationError = ValidateDates(request.DateStart, request.DateEnd);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        var item = new InfoItem
        {
            Type = InfoItemType.Event,
            Title = request.Title.Trim(),
            Category = request.Category.Trim(),
            Status = NormalizeStatus(request.Status),
            DateStart = request.DateStart.Date,
            DateEnd = request.DateEnd?.Date,
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
            message = "Событие успешно создано",
            @event = ToResponse(item)
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateEvent(
        [FromRoute] int id,
        [FromBody] AdminEventRequest request,
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

        var validationError = ValidateDates(request.DateStart, request.DateEnd);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        var item = await _dbContext.InfoItems
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Type == InfoItemType.Event,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Событие не найдено"
            });
        }

        item.Title = request.Title.Trim();
        item.Category = request.Category.Trim();
        item.Status = NormalizeStatus(request.Status);
        item.DateStart = request.DateStart.Date;
        item.DateEnd = request.DateEnd?.Date;
        item.ImageUrl = NormalizeNullable(request.ImageUrl);
        item.Gradient = NormalizeNullable(request.Gradient);
        item.Excerpt = NormalizeNullable(request.Excerpt);
        item.Content = NormalizeNullable(request.Content);
        item.IsPublished = request.IsPublished;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Событие успешно обновлено",
            @event = ToResponse(item)
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
                x => x.Id == id && x.Type == InfoItemType.Event,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Событие не найдено"
            });
        }

        item.IsPublished = value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = value
                ? "Событие опубликовано"
                : "Событие снято с публикации"
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteEvent(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var item = await _dbContext.InfoItems
            .FirstOrDefaultAsync(
                x => x.Id == id && x.Type == InfoItemType.Event,
                cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Событие не найдено"
            });
        }

        _dbContext.InfoItems.Remove(item);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Событие удалено"
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

    private static string? ValidateDates(DateTime dateStart, DateTime? dateEnd)
    {
        if (dateEnd.HasValue && dateEnd.Value.Date < dateStart.Date)
        {
            return "Дата окончания события не может быть раньше даты начала";
        }

        return null;
    }

    private static string NormalizeStatus(string status)
    {
        var normalized = status.Trim();

        return string.IsNullOrWhiteSpace(normalized)
            ? "soon"
            : normalized;
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static AdminEventResponse ToResponse(InfoItem item)
    {
        var culture = CultureInfo.GetCultureInfo("ru-RU");
        var dateEnd = item.DateEnd ?? item.DateStart;

        return new AdminEventResponse
        {
            Id = item.Id,
            Title = item.Title,
            Category = item.Category,
            Status = item.Status ?? "soon",
            DateStart = item.DateStart.ToString("d MMMM yyyy", culture),
            DateEnd = dateEnd.ToString("d MMMM yyyy", culture),
            DateStartISO = item.DateStart.ToString("yyyy-MM-dd"),
            DateEndISO = dateEnd.ToString("yyyy-MM-dd"),
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