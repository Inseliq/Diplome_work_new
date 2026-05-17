using CosmoManager.Data;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/home-banners")]
public class HomeBannersController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public HomeBannersController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetHomeBanners(CancellationToken cancellationToken)
    {
        var banners = await _dbContext.HomeBanners
            .AsNoTracking()
            .Where(x => x.IsPublished)
            .OrderBy(x => x.Slot)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Select(x => new HomeBannerResponse
            {
                Id = x.Id,
                Slot = x.Slot,
                Title = x.Title,
                Description = x.Description,
                ButtonLabel = x.ButtonLabel,
                ButtonUrl = x.ButtonUrl,
                ImageUrl = x.ImageUrl,
                Gradient = x.Gradient
            })
            .ToListAsync(cancellationToken);

        return Ok(banners);
    }
}