using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/clans")]
public class ClansController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public ClansController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetClans(CancellationToken cancellationToken)
    {
        var clans = await _dbContext.Clans
            .AsNoTracking()
            .OrderByDescending(x => x.EloRating)
            .ThenBy(x => x.Tag)
            .Select(x => new ClanResponse(
                x.Id,
                x.Tag,
                x.Name,
                x.Description,
                x.EloRating,
                x.Users.Count,
                x.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return Ok(clans);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetClan(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var clan = await _dbContext.Clans
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new ClanDetailsResponse(
                x.Id,
                x.Tag,
                x.Name,
                x.Description,
                x.EloRating,
                x.Users.Count,
                x.CreatedAtUtc,
                x.Users
                    .OrderByDescending(u => u.ClanRank)
                    .ThenBy(u => u.Nickname)
                    .Select(u => new ClanUserResponse(
                        u.Id,
                        u.Nickname,
                        u.Email,
                        u.ClanRank.HasValue ? u.ClanRank.Value.ToString() : string.Empty,
                        u.ClanRank.HasValue ? ClanRankHelper.GetLabel(u.ClanRank.Value) : "Без звания",
                        Array.Empty<string>()
                    ))
                    .ToArray()
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (clan == null)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        return Ok(clan);
    }

    [HttpGet("{id:int}/players")]
    public async Task<IActionResult> GetClanPlayers(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        var clanExists = await _dbContext.Clans
            .AsNoTracking()
            .AnyAsync(x => x.Id == id, cancellationToken);

        if (!clanExists)
        {
            return NotFound(new
            {
                message = "Клан не найден"
            });
        }

        var players = await _dbContext.Users
            .AsNoTracking()
            .Where(x => x.ClanId == id)
            .OrderByDescending(x => x.ClanRank)
            .ThenBy(x => x.Nickname)
            .Select(x => new ClanUserResponse(
                x.Id,
                x.Nickname,
                x.Email,
                x.ClanRank.HasValue ? x.ClanRank.Value.ToString() : string.Empty,
                x.ClanRank.HasValue ? ClanRankHelper.GetLabel(x.ClanRank.Value) : "Без звания",
                Array.Empty<string>()
            ))
            .ToListAsync(cancellationToken);

        return Ok(players);
    }
}