using System.Globalization;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Responses.Tournaments;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/tournaments/custom/{tournamentId:int}/matches")]
public class TournamentMatchesController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TournamentMatchesController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TournamentMatchResponse>>> GetTournamentMatches(
        [FromRoute] int tournamentId,
        CancellationToken cancellationToken)
    {
        var tournamentExists = await _dbContext.Tournaments
            .AsNoTracking()
            .AnyAsync(x => x.Id == tournamentId && x.IsPublished, cancellationToken);

        if (!tournamentExists)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        var matches = await _dbContext.TournamentMatches
            .AsNoTracking()
            .Include(x => x.Slots)
                .ThenInclude(x => x.Registration)
                    .ThenInclude(x => x.User)
            .Where(x => x.TournamentId == tournamentId)
            .OrderBy(x => x.Bracket)
            .ThenByDescending(x => x.RoundSize)
            .ThenBy(x => x.RoundNumber)
            .ThenBy(x => x.MatchNumber)
            .ToListAsync(cancellationToken);

        return Ok(matches.Select(ToMatchResponse).ToList());
    }

    private static TournamentMatchResponse ToMatchResponse(TournamentMatch match)
    {
        return new TournamentMatchResponse
        {
            Id = match.Id,
            TournamentId = match.TournamentId,
            Bracket = match.Bracket,
            RoundSize = match.RoundSize,
            RoundTitle = GetRoundTitle(match.RoundSize),
            RoundNumber = match.RoundNumber,
            MatchNumber = match.MatchNumber,
            Status = match.Status,
            ResultStatus = match.ResultStatus,
            Team1Score = match.Team1Score,
            Team2Score = match.Team2Score,
            WinnerRegistrationId = match.WinnerRegistrationId,
            AdvancingRegistrationId = match.AdvancingRegistrationId,
            WinnerToMatchId = match.WinnerToMatchId,
            WinnerToSlotNumber = match.WinnerToSlotNumber,
            LoserToMatchId = match.LoserToMatchId,
            LoserToSlotNumber = match.LoserToSlotNumber,
            ScheduledAt = match.ScheduledAtUtc?.ToString("d MMMM yyyy HH:mm", CultureInfo.GetCultureInfo("ru-RU")),
            ScheduledAtISO = match.ScheduledAtUtc?.ToString("O"),
            StartedAtISO = match.StartedAtUtc?.ToString("O"),
            FinishedAtISO = match.FinishedAtUtc?.ToString("O"),
            StreamUrl = match.StreamUrl,
            Comment = match.Comment,
            Slots = match.Slots
                .OrderBy(x => x.SlotNumber)
                .Select(slot => new TournamentMatchSlotResponse
                {
                    Id = slot.Id,
                    SlotNumber = slot.SlotNumber,
                    RegistrationId = slot.RegistrationId,
                    TeamName = GetTeamName(slot.Registration),
                    CaptainNickname = slot.Registration?.User?.Nickname,
                    SourceMatchId = slot.SourceMatchId,
                    SourceResult = slot.SourceResult,
                    SeedNumber = slot.SeedNumber,
                    IsBye = slot.IsBye,
                    IsWinner = slot.RegistrationId != null &&
                               slot.RegistrationId == match.WinnerRegistrationId,
                    IsAdvancing = slot.RegistrationId != null &&
                                  slot.RegistrationId == match.AdvancingRegistrationId
                })
                .ToList()
        };
    }

    private static string GetRoundTitle(int roundSize)
    {
        return roundSize switch
        {
            2 => "Финал",
            4 => "1/2",
            8 => "1/4",
            16 => "1/8",
            32 => "1/16",
            64 => "1/32",
            128 => "1/64",
            _ => $"Раунд {roundSize}"
        };
    }

    private static string? GetTeamName(TournamentRegistration? registration)
    {
        if (registration == null)
        {
            return null;
        }

        if (!string.IsNullOrWhiteSpace(registration.TeamName))
        {
            return registration.TeamName;
        }

        return registration.User.Nickname;
    }
}