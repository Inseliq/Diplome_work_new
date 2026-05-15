using CosmoManager.Data;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/notification")]
public class NotificationController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public NotificationController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("latest")]
    public async Task<IActionResult> GetLatest(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var notification = await _dbContext.PopupNotifications
            .AsNoTracking()
            .Where(x => x.IsPublished)
            .Where(x => x.StartsAtUtc == null || x.StartsAtUtc <= now)
            .Where(x => x.EndsAtUtc == null || x.EndsAtUtc >= now)
            .OrderByDescending(x => x.SortOrder)
            .ThenByDescending(x => x.CreatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (notification == null)
        {
            return NoContent();
        }

        return Ok(new NotificationResponse
        {
            Id = notification.Id,
            Message = notification.Message,
            Description = notification.Description,
            SourceButton = notification.SourceButton
        });
    }
}