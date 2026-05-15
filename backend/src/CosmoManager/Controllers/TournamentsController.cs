using System.Globalization;
using System.Security.Claims;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests.Tournaments;
using CosmoManager.Responses.Tournaments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/tournaments")]
public class TournamentsController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public TournamentsController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("custom")]
    public async Task<ActionResult<IEnumerable<TournamentResponse>>> GetCustomTournaments(
    CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        var tournaments = await _dbContext.Tournaments
            .AsNoTracking()
            .Include(x => x.Maps)
            .Include(x => x.Prizes)
            .Include(x => x.Registrations)
            .Where(x => x.IsPublished)
            .ToListAsync(cancellationToken);

        var sortedTournaments = tournaments
            .OrderBy(x => GetStatusOrder(x.Status))
            .ThenBy(x => x.DateStart)
            .Select(x => ToResponse(x, userId))
            .ToList();

        return Ok(sortedTournaments);
    }

    [HttpGet("custom/{id:int}")]
    public async Task<ActionResult<TournamentResponse>> GetCustomTournamentById(
        int id,
        CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var tournament = await _dbContext.Tournaments
            .AsNoTracking()
            .Include(x => x.Maps)
            .Include(x => x.Prizes)
            .Include(x => x.Registrations)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        return Ok(ToResponse(tournament, userId));
    }

    [HttpPost("custom/{id:int}/register")]
    [Authorize]
    public async Task<IActionResult> RegisterToTournament(
    int id,
    [FromBody] TournamentRegisterRequest request,
    CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub");

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        var tournament = await _dbContext.Tournaments
            .Include(x => x.Registrations)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        if (tournament.Status != "registration")
        {
            return BadRequest(new
            {
                message = "Регистрация на этот турнир сейчас закрыта"
            });
        }

        var alreadyRegistered = tournament.Registrations
            .Any(x => x.AppUserId == userId);

        if (alreadyRegistered)
        {
            return BadRequest(new
            {
                message = "Вы уже зарегистрированы на этот турнир"
            });
        }

        var currentParticipants = tournament.InitialParticipants + tournament.Registrations.Count;

        if (tournament.MaxParticipants.HasValue &&
            currentParticipants >= tournament.MaxParticipants.Value)
        {
            return BadRequest(new
            {
                message = "Свободных мест на турнир больше нет"
            });
        }

        var registration = new TournamentRegistration
        {
            TournamentId = tournament.Id,
            AppUserId = userId,
            TeamName = request.TeamName?.Trim(),
            Contact = request.Contact?.Trim(),
            Comment = request.Comment?.Trim(),
            RegisteredAtUtc = DateTime.UtcNow
        };

        _dbContext.TournamentRegistrations.Add(registration);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Вы успешно зарегистрированы на турнир"
        });
    }

    private static TournamentResponse ToResponse(Tournament tournament, string? userId)
    {
        var registrationsCount = tournament.Registrations?.Count ?? 0;

        return new TournamentResponse
        {
            Id = tournament.Id,
            Name = tournament.Name,
            Description = tournament.Description,
            Type = tournament.Type,
            Tier = tournament.Tier,
            Format = tournament.Format,
            TeamSize = tournament.TeamSize,
            ReserveSize = tournament.ReserveSize,
            MaxParticipants = tournament.MaxParticipants,
            CurrentParticipants = tournament.InitialParticipants + registrationsCount,
            Classes = SplitClasses(tournament.Classes),
            Status = tournament.Status,
            IsStream = tournament.IsStream,
            StreamUrl = tournament.StreamUrl,
            DateStart = FormatDate(tournament.DateStart),
            DateEnd = FormatDate(tournament.DateEnd),
            DateStartISO = ToIsoDate(tournament.DateStart),
            DateEndISO = ToIsoDate(tournament.DateEnd),
            RegStart = FormatDate(tournament.RegStart),
            RegEnd = FormatDate(tournament.RegEnd),
            RegStartISO = ToIsoDate(tournament.RegStart),
            RegEndISO = ToIsoDate(tournament.RegEnd),
            OpenForAll = tournament.OpenForAll,
            Sponsor = tournament.Sponsor,
            EventId = tournament.EventId,
            Maps = tournament.Maps
                .OrderBy(x => x.Id)
                .Select(x => new TournamentMapResponse
                {
                    Name = x.Name,
                    Image = x.Image
                })
                .ToList(),
            Prizes = BuildPrizes(tournament.Prizes),
            PrizeText = tournament.PrizeText,
            IsRegistered = !string.IsNullOrWhiteSpace(userId) &&
                           tournament.Registrations.Any(x => x.AppUserId == userId)
        };
    }

    private static TournamentPrizesResponse BuildPrizes(IEnumerable<TournamentPrize> prizes)
    {
        var list = prizes.ToList();

        return new TournamentPrizesResponse
        {
            Place1 = ToPrizeResponse(list.FirstOrDefault(x => x.Place == "place1")),
            Place2 = ToPrizeResponse(list.FirstOrDefault(x => x.Place == "place2")),
            Place3 = ToPrizeResponse(list.FirstOrDefault(x => x.Place == "place3")),
            Others = ToPrizeResponse(list.FirstOrDefault(x => x.Place == "others"))
        };
    }

    private static TournamentPrizeResponse? ToPrizeResponse(TournamentPrize? prize)
    {
        if (prize == null)
        {
            return null;
        }

        return new TournamentPrizeResponse
        {
            Amount = prize.Amount,
            Type = prize.Type,
            Text = prize.Text
        };
    }

    private static string[] SplitClasses(string classes)
    {
        if (string.IsNullOrWhiteSpace(classes))
        {
            return [];
        }

        return classes
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    }

    private static int GetStatusOrder(string status)
    {
        return status switch
        {
            "active" => 0,
            "registration" => 1,
            "upcoming" => 2,
            "finished" => 3,
            _ => 9
        };
    }

    private static string FormatDate(DateTime date)
    {
        return date.ToString("d MMMM yyyy", CultureInfo.GetCultureInfo("ru-RU"));
    }

    private static string ToIsoDate(DateTime date)
    {
        return date.ToString("yyyy-MM-dd");
    }
}