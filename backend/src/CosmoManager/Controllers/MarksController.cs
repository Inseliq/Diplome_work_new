using CosmoManager.Data;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarksController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public MarksController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetMarks(CancellationToken cancellationToken)
    {
        var syncState = await _dbContext.DataSyncStates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == "marks", cancellationToken);

        var tanks = await _dbContext.VehicleMarks
            .AsNoTracking()
            .Include(x => x.Vehicle)
            .OrderByDescending(x => x.Moe100)
            .Select(x => new TankMarkResponse
            {
                TankId = x.VehicleId,
                InternalName = x.Vehicle.InternalName,
                Nation = x.Vehicle.Nation,
                Type = x.Vehicle.Type,
                Tier = x.Vehicle.Tier,
                Name = x.Vehicle.Name,
                ShortName = x.Vehicle.ShortName,
                IsPremium = x.Vehicle.IsPremium,
                IsSpecial = x.Vehicle.IsSpecial,
                IsCollector = x.Vehicle.IsCollector,
                Role = x.Vehicle.Role,
                Moe65 = x.Moe65,
                Moe85 = x.Moe85,
                Moe95 = x.Moe95,
                Moe100 = x.Moe100
            })
            .ToListAsync(cancellationToken);

        if (tanks.Count == 0)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Данные отметок ещё не загружены"
            });
        }

        return Ok(new MarksResponse
        {
            UpdatedAtUtc = syncState?.LastSuccessAtUtc,
            Tanks = tanks
        });
    }
}