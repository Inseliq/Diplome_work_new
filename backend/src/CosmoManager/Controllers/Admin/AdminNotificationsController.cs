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
[Route("api/admin/notifications")]
[Authorize]
public class AdminNotificationsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminNotificationsController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications(CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Доступ разрешён только администратору"
            });
        }

        var now = DateTime.UtcNow;

        var notifications = await _dbContext.PopupNotifications
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);

        var activeId = notifications
            .Where(x =>
                x.IsPublished &&
                (x.StartsAtUtc == null || x.StartsAtUtc <= now) &&
                (x.EndsAtUtc == null || x.EndsAtUtc >= now))
            .OrderByDescending(x => x.SortOrder)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(x => (int?)x.Id)
            .FirstOrDefault();

        var items = notifications
            .Select(x => ToResponse(x, activeId))
            .ToList();

        return Ok(new AdminNotificationsPageResponse
        {
            Active = items.FirstOrDefault(x => x.IsActive),
            Items = items
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateNotification(
        [FromBody] CreateAdminNotificationRequest request,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Доступ разрешён только администратору"
            });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.StartsAtUtc.HasValue &&
            request.EndsAtUtc.HasValue &&
            request.StartsAtUtc.Value >= request.EndsAtUtc.Value)
        {
            return BadRequest(new
            {
                message = "Дата начала показа должна быть раньше даты окончания"
            });
        }

        var notification = new PopupNotification
        {
            Message = request.Message.Trim(),
            Description = request.Description.Trim(),
            SourceButton = string.IsNullOrWhiteSpace(request.SourceButton)
                ? null
                : request.SourceButton.Trim(),
            IsPublished = request.IsPublished,
            StartsAtUtc = request.StartsAtUtc,
            EndsAtUtc = request.EndsAtUtc,
            SortOrder = request.SortOrder,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.PopupNotifications.Add(notification);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Уведомление успешно создано",
            notification = ToResponse(notification, notification.Id)
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
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Доступ разрешён только администратору"
            });
        }

        var notification = await _dbContext.PopupNotifications
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (notification == null)
        {
            return NotFound(new
            {
                message = "Уведомление не найдено"
            });
        }

        notification.IsPublished = value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = value
                ? "Уведомление опубликовано"
                : "Уведомление снято с публикации"
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNotification(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Доступ разрешён только администратору"
            });
        }

        var notification = await _dbContext.PopupNotifications
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (notification == null)
        {
            return NotFound(new
            {
                message = "Уведомление не найдено"
            });
        }

        _dbContext.PopupNotifications.Remove(notification);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Уведомление удалено"
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

    private static AdminNotificationResponse ToResponse(
        PopupNotification notification,
        int? activeId)
    {
        var culture = CultureInfo.GetCultureInfo("ru-RU");

        return new AdminNotificationResponse
        {
            Id = notification.Id,
            Message = notification.Message,
            Description = notification.Description,
            SourceButton = notification.SourceButton,
            IsPublished = notification.IsPublished,
            IsActive = activeId.HasValue && notification.Id == activeId.Value,
            CreatedAtUtc = notification.CreatedAtUtc,
            CreatedAt = notification.CreatedAtUtc.ToString("d MMMM yyyy HH:mm", culture),
            StartsAtUtc = notification.StartsAtUtc,
            EndsAtUtc = notification.EndsAtUtc,
            SortOrder = notification.SortOrder
        };
    }
}