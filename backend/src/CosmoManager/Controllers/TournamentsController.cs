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
                .ThenInclude(x => x.Players)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.User)
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
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
             ?? User.FindFirstValue("sub");

        var tournament = await _dbContext.Tournaments
            .AsNoTracking()
            .Include(x => x.Maps)
            .Include(x => x.Prizes)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.Players)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.User)
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

        var user = await _dbContext.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == userId, cancellationToken);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Пользователь не найден"
            });
        }

        var tournament = await _dbContext.Tournaments
            .Include(x => x.Registrations)
                .ThenInclude(x => x.Players)
            .FirstOrDefaultAsync(x => x.Id == id && x.IsPublished, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        if (!tournament.OpenForAll)
        {
            return BadRequest(new
            {
                message = "Регистрация на этот турнир недоступна"
            });
        }

        if (tournament.Status != "registration")
        {
            return BadRequest(new
            {
                message = "Регистрация на этот турнир сейчас закрыта"
            });
        }

        var existingRegistration = tournament.Registrations
            .FirstOrDefault(x => x.AppUserId == userId);

        if (existingRegistration != null)
        {
            var message = existingRegistration.Status == TournamentRegistrationStatus.Rejected
                ? "Ваша заявка была отклонена. Повторная регистрация на этот турнир недоступна."
                : "Вы уже отправили заявку на этот турнир";

            return BadRequest(new
            {
                message
            });
        }

        var currentParticipants = tournament.InitialParticipants + tournament.Registrations.Count(x =>
            x.Status is TournamentRegistrationStatus.Sent or TournamentRegistrationStatus.Confirmed);

        if (tournament.MaxParticipants.HasValue &&
            currentParticipants >= tournament.MaxParticipants.Value)
        {
            return BadRequest(new
            {
                message = "Свободных мест на турнир больше нет"
            });
        }

        var validationError = await ValidateRegistrationPlayersAsync(
            tournament,
            user.Nickname,
            request,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        var registration = new TournamentRegistration
        {
            TournamentId = tournament.Id,
            AppUserId = userId,
            TeamName = request.TeamName.Trim(),
            Contact = request.Contact.Trim(),
            Comment = NormalizeNullable(request.Comment),
            Status = TournamentRegistrationStatus.Sent,
            RegisteredAtUtc = DateTime.UtcNow
        };

        var sortOrder = 1;

        registration.Players.Add(new TournamentRegistrationPlayer
        {
            TournamentId = tournament.Id,
            Nickname = user.Nickname.Trim(),
            NormalizedNickname = NormalizeNickname(user.Nickname),
            Role = TournamentRegistrationPlayerRole.Captain,
            SortOrder = sortOrder++,
            BlocksNickname = true
        });

        foreach (var nickname in (request.Members ?? []).Select(x => x.Trim()))
        {
            registration.Players.Add(new TournamentRegistrationPlayer
            {
                TournamentId = tournament.Id,
                Nickname = nickname,
                NormalizedNickname = NormalizeNickname(nickname),
                Role = TournamentRegistrationPlayerRole.Main,
                SortOrder = sortOrder++,
                BlocksNickname = true
            });
        }

        foreach (var nickname in (request.Reserves ?? [])
             .Select(x => x.Trim())
             .Where(x => !string.IsNullOrWhiteSpace(x)))
        {
            registration.Players.Add(new TournamentRegistrationPlayer
            {
                TournamentId = tournament.Id,
                Nickname = nickname,
                NormalizedNickname = NormalizeNickname(nickname),
                Role = TournamentRegistrationPlayerRole.Reserve,
                SortOrder = sortOrder++,
                BlocksNickname = true
            });
        }

        _dbContext.TournamentRegistrations.Add(registration);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var loadedRegistration = await _dbContext.TournamentRegistrations
            .AsNoTracking()
            .Include(x => x.Players)
            .FirstAsync(x => x.Id == registration.Id, cancellationToken);

        return Ok(new
        {
            message = "Заявка отправлена на рассмотрение",
            registration = ToMyRegistrationResponse(loadedRegistration)
        });
    }

    private async Task<string?> ValidateRegistrationPlayersAsync(
    Tournament tournament,
    string captainNickname,
    TournamentRegisterRequest request,
    CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.TeamName))
        {
            return "Введите название команды";
        }

        if (string.IsNullOrWhiteSpace(request.Contact))
        {
            return "Введите контакт для связи";
        }

        var requiredMembersCount = Math.Max(0, tournament.TeamSize - 1);

        var members = (request.Members ?? [])
            .Select(x => x?.Trim() ?? string.Empty)
            .ToList();

        var reserves = (request.Reserves ?? [])
            .Select(x => x?.Trim() ?? string.Empty)
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .ToList();

        if (members.Count != requiredMembersCount)
        {
            return $"Для формата турнира нужно указать игроков основного состава: {requiredMembersCount}";
        }

        if (members.Any(string.IsNullOrWhiteSpace))
        {
            return "Заполните все ники основного состава";
        }

        if (reserves.Count > tournament.ReserveSize)
        {
            return $"Можно указать запасных игроков не больше: {tournament.ReserveSize}";
        }

        var allNicknames = new List<string>
    {
        captainNickname.Trim()
    };

        allNicknames.AddRange(members);
        allNicknames.AddRange(reserves);

        foreach (var nickname in allNicknames)
        {
            if (!IsValidGameNickname(nickname))
            {
                return $"Некорректный ник: {nickname}. Разрешены A-Z, a-z, 0-9 и _. Длина от 3 до 24 символов.";
            }
        }

        var normalized = allNicknames
            .Select(NormalizeNickname)
            .ToList();

        var duplicateInsideTeam = normalized
            .GroupBy(x => x)
            .FirstOrDefault(x => x.Count() > 1);

        if (duplicateInsideTeam != null)
        {
            return "В составе команды нельзя указывать одинаковые ники";
        }

        var usedNicknames = await _dbContext.TournamentRegistrationPlayers
            .AsNoTracking()
            .Where(x => x.TournamentId == tournament.Id)
            .Where(x => x.BlocksNickname)
            .Where(x => normalized.Contains(x.NormalizedNickname))
            .Select(x => x.Nickname)
            .ToListAsync(cancellationToken);

        if (usedNicknames.Count > 0)
        {
            return $"Один или несколько игроков уже зарегистрированы в этом турнире: {string.Join(", ", usedNicknames)}";
        }

        return null;
    }

    private static bool IsValidGameNickname(string nickname)
    {
        if (string.IsNullOrWhiteSpace(nickname))
        {
            return false;
        }

        return System.Text.RegularExpressions.Regex.IsMatch(
            nickname.Trim(),
            "^[A-Za-z0-9_]{3,24}$");
    }

    private static string NormalizeNickname(string nickname)
    {
        return nickname.Trim().ToUpperInvariant();
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static string GetRegistrationStatusLabel(TournamentRegistrationStatus status)
    {
        return status switch
        {
            TournamentRegistrationStatus.Sent => "Заявка на рассмотрении",
            TournamentRegistrationStatus.Confirmed => "Заявка принята",
            TournamentRegistrationStatus.Rejected => "Заявка отклонена",
            _ => status.ToString()
        };
    }

    private static string GetPlayerRoleLabel(TournamentRegistrationPlayerRole role)
    {
        return role switch
        {
            TournamentRegistrationPlayerRole.Captain => "Командир",
            TournamentRegistrationPlayerRole.Main => "Основной состав",
            TournamentRegistrationPlayerRole.Reserve => "Запасной",
            _ => role.ToString()
        };
    }

    private static TournamentMyRegistrationResponse ToMyRegistrationResponse(TournamentRegistration registration)
    {
        return new TournamentMyRegistrationResponse
        {
            Id = registration.Id,
            TournamentId = registration.TournamentId,
            TeamName = registration.TeamName ?? string.Empty,
            Contact = registration.Contact,
            Comment = registration.Comment,
            Status = registration.Status.ToString(),
            StatusLabel = GetRegistrationStatusLabel(registration.Status),
            RegisteredAtUtc = registration.RegisteredAtUtc,
            RegisteredAt = FormatDateTime(registration.RegisteredAtUtc),
            Players = registration.Players
                .OrderBy(x => x.SortOrder)
                .Select(x => new TournamentRegistrationPlayerResponse
                {
                    Id = x.Id,
                    Nickname = x.Nickname,
                    Role = x.Role.ToString(),
                    RoleLabel = GetPlayerRoleLabel(x.Role),
                    SortOrder = x.SortOrder
                })
                .ToArray()
        };
    }

    private static string FormatDateTime(DateTime date)
    {
        return date.ToString("d MMMM yyyy HH:mm", CultureInfo.GetCultureInfo("ru-RU"));
    }

    private static TournamentResponse ToResponse(Tournament tournament, string? userId)
    {
        var registrations = tournament.Registrations ?? [];

        var activeRegistrationsCount = registrations
            .Count(x => x.Status is TournamentRegistrationStatus.Sent
                     or TournamentRegistrationStatus.Confirmed);

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
            CurrentParticipants = tournament.InitialParticipants + activeRegistrationsCount,
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
                           registrations.Any(x => x.AppUserId == userId),

            MyRegistration = !string.IsNullOrWhiteSpace(userId)
                ? registrations
                    .Where(x => x.AppUserId == userId)
                    .Select(ToMyRegistrationResponse)
                    .FirstOrDefault()
                : null
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