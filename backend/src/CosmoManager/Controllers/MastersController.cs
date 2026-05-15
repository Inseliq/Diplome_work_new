using CosmoManager.Data;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MastersController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public MastersController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetMasters(CancellationToken cancellationToken)
    {
        var syncState = await _dbContext.DataSyncStates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == "masters", cancellationToken);

        var tanks = await _dbContext.VehicleMasteries
            .AsNoTracking()
            .Include(x => x.Vehicle)
            .OrderByDescending(x => x.Master)
            .Select(x => new TankMasteryResponse
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
                Deg3 = x.Deg3,
                Deg2 = x.Deg2,
                Deg1 = x.Deg1,
                Master = x.Master
            })
            .ToListAsync(cancellationToken);

        if (tanks.Count == 0)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                message = "Данные знаков классности ещё не загружены"
            });
        }

        return Ok(new MastersResponse
        {
            UpdatedAtUtc = syncState?.LastSuccessAtUtc,
            Tanks = tanks
        });
    }
}