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
[Route("api/admin/tournaments")]
[Authorize]
public class AdminTournamentsController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminTournamentsController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetTournaments(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var query = _dbContext.Tournaments
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.Event)
            .Include(x => x.Maps)
            .Include(x => x.Prizes)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.User)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.Players)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();

            query = query.Where(x =>
                x.Name.ToLower().Contains(normalized) ||
                x.Description.ToLower().Contains(normalized) ||
                x.Format.ToLower().Contains(normalized) ||
                x.Status.ToLower().Contains(normalized));
        }

        var tournaments = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .ThenByDescending(x => x.DateStart)
            .Take(100)
            .ToListAsync(cancellationToken);

        return Ok(tournaments.Select(ToResponse).ToList());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTournament(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var tournament = await LoadTournamentAsync(id, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        return Ok(ToResponse(tournament));
    }

    [HttpPost]
    public async Task<IActionResult> CreateTournament(
        [FromBody] AdminTournamentRequest request,
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

        var validationError = await ValidateTournamentRequestAsync(
            request,
            currentTournamentId: null,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        var tournament = new Tournament
        {
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Type = request.Type.Trim(),
            Tier = request.Tier,
            Format = request.Format.Trim(),
            TeamSize = request.TeamSize,
            ReserveSize = request.ReserveSize,
            MaxParticipants = request.MaxParticipants,
            InitialParticipants = request.InitialParticipants,
            Classes = NormalizeNullable(request.Classes) ?? string.Empty,
            Status = request.Status.Trim(),
            IsStream = request.IsStream,
            StreamUrl = NormalizeNullable(request.StreamUrl),
            DateStart = request.DateStart.Date,
            DateEnd = request.DateEnd.Date,
            RegStart = request.RegStart.Date,
            RegEnd = request.RegEnd.Date,
            OpenForAll = request.OpenForAll,
            Sponsor = NormalizeNullable(request.Sponsor),
            PrizeText = NormalizeNullable(request.PrizeText),
            IsPublished = request.IsPublished,
            EventId = request.EventId,
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.Tournaments.Add(tournament);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var loaded = await LoadTournamentAsync(tournament.Id, cancellationToken);

        return Ok(new
        {
            message = "Турнир успешно создан",
            tournament = ToResponse(loaded!)
        });
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTournament(
        [FromRoute] int id,
        [FromBody] AdminTournamentRequest request,
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

        var tournament = await _dbContext.Tournaments
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        var validationError = await ValidateTournamentRequestAsync(
            request,
            currentTournamentId: id,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        tournament.Name = request.Name.Trim();
        tournament.Description = request.Description.Trim();
        tournament.Type = request.Type.Trim();
        tournament.Tier = request.Tier;
        tournament.Format = request.Format.Trim();
        tournament.TeamSize = request.TeamSize;
        tournament.ReserveSize = request.ReserveSize;
        tournament.MaxParticipants = request.MaxParticipants;
        tournament.InitialParticipants = request.InitialParticipants;
        tournament.Classes = NormalizeNullable(request.Classes) ?? string.Empty;
        tournament.Status = request.Status.Trim();
        tournament.IsStream = request.IsStream;
        tournament.StreamUrl = NormalizeNullable(request.StreamUrl);
        tournament.DateStart = request.DateStart.Date;
        tournament.DateEnd = request.DateEnd.Date;
        tournament.RegStart = request.RegStart.Date;
        tournament.RegEnd = request.RegEnd.Date;
        tournament.OpenForAll = request.OpenForAll;
        tournament.Sponsor = NormalizeNullable(request.Sponsor);
        tournament.PrizeText = NormalizeNullable(request.PrizeText);
        tournament.IsPublished = request.IsPublished;
        tournament.EventId = request.EventId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        var loaded = await LoadTournamentAsync(tournament.Id, cancellationToken);

        return Ok(new
        {
            message = "Турнир успешно обновлён",
            tournament = ToResponse(loaded!)
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

        var tournament = await _dbContext.Tournaments
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        tournament.IsPublished = value;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = value
                ? "Турнир опубликован"
                : "Турнир снят с публикации"
        });
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTournament(
        [FromRoute] int id,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var tournament = await _dbContext.Tournaments
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (tournament == null)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        _dbContext.Tournaments.Remove(tournament);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(new
        {
            message = "Турнир удалён"
        });
    }

    [HttpDelete("{tournamentId:int}/registrations/{registrationId:int}")]
    public async Task<IActionResult> DeleteRegistration(
    [FromRoute] int tournamentId,
    [FromRoute] int registrationId,
    CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var registration = await _dbContext.TournamentRegistrations
            .Include(x => x.Players)
            .FirstOrDefaultAsync(
                x => x.Id == registrationId && x.TournamentId == tournamentId,
                cancellationToken);

        if (registration == null)
        {
            return NotFound(new
            {
                message = "Регистрация не найдена"
            });
        }

        if (registration.Status == TournamentRegistrationStatus.Confirmed)
        {
            return BadRequest(new
            {
                message = "Подтверждённую заявку удалить нельзя"
            });
        }

        if (registration.Status == TournamentRegistrationStatus.Rejected)
        {
            return BadRequest(new
            {
                message = "Отклонённую заявку удалять нельзя, иначе пользователь сможет подать заявку повторно"
            });
        }

        var usedInMatches = await _dbContext.TournamentMatchSlots
            .AnyAsync(x => x.RegistrationId == registrationId, cancellationToken);

        var usedAsWinnerOrAdvancing = await _dbContext.TournamentMatches
            .AnyAsync(
                x => x.WinnerRegistrationId == registrationId ||
                     x.AdvancingRegistrationId == registrationId,
                cancellationToken);

        if (usedInMatches || usedAsWinnerOrAdvancing)
        {
            return BadRequest(new
            {
                message = "Эта команда уже используется в матчах. Сначала удалите или измените связанные матчи."
            });
        }

        _dbContext.TournamentRegistrations.Remove(registration);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Заявка удалена",
            tournament = tournament == null ? null : ToResponse(tournament)
        });
    }

    [HttpPost("{tournamentId:int}/maps")]
    public async Task<IActionResult> CreateMap(
        [FromRoute] int tournamentId,
        [FromBody] AdminTournamentMapRequest request,
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

        var tournamentExists = await _dbContext.Tournaments
            .AnyAsync(x => x.Id == tournamentId, cancellationToken);

        if (!tournamentExists)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        var map = new TournamentMap
        {
            TournamentId = tournamentId,
            Name = request.Name.Trim(),
            Image = request.Image.Trim()
        };

        _dbContext.TournamentMaps.Add(map);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Карта добавлена",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpPut("{tournamentId:int}/maps/{mapId:int}")]
    public async Task<IActionResult> UpdateMap(
        [FromRoute] int tournamentId,
        [FromRoute] int mapId,
        [FromBody] AdminTournamentMapRequest request,
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

        var map = await _dbContext.TournamentMaps
            .FirstOrDefaultAsync(
                x => x.Id == mapId && x.TournamentId == tournamentId,
                cancellationToken);

        if (map == null)
        {
            return NotFound(new
            {
                message = "Карта не найдена"
            });
        }

        map.Name = request.Name.Trim();
        map.Image = request.Image.Trim();

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Карта обновлена",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpDelete("{tournamentId:int}/maps/{mapId:int}")]
    public async Task<IActionResult> DeleteMap(
        [FromRoute] int tournamentId,
        [FromRoute] int mapId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var map = await _dbContext.TournamentMaps
            .FirstOrDefaultAsync(
                x => x.Id == mapId && x.TournamentId == tournamentId,
                cancellationToken);

        if (map == null)
        {
            return NotFound(new
            {
                message = "Карта не найдена"
            });
        }

        _dbContext.TournamentMaps.Remove(map);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Карта удалена",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpPost("{tournamentId:int}/prizes")]
    public async Task<IActionResult> CreatePrize(
        [FromRoute] int tournamentId,
        [FromBody] AdminTournamentPrizeRequest request,
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

        var tournamentExists = await _dbContext.Tournaments
            .AnyAsync(x => x.Id == tournamentId, cancellationToken);

        if (!tournamentExists)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        var place = request.Place.Trim();

        var placeBusy = await _dbContext.TournamentPrizes
            .AnyAsync(
                x => x.TournamentId == tournamentId && x.Place == place,
                cancellationToken);

        if (placeBusy)
        {
            return BadRequest(new
            {
                message = "Приз для этого места уже существует. Измените существующий приз."
            });
        }

        var prize = new TournamentPrize
        {
            TournamentId = tournamentId,
            Place = place,
            Amount = request.Amount,
            Type = request.Type.Trim(),
            Text = NormalizeNullable(request.Text)
        };

        _dbContext.TournamentPrizes.Add(prize);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Приз добавлен",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpPut("{tournamentId:int}/prizes/{prizeId:int}")]
    public async Task<IActionResult> UpdatePrize(
        [FromRoute] int tournamentId,
        [FromRoute] int prizeId,
        [FromBody] AdminTournamentPrizeRequest request,
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

        var prize = await _dbContext.TournamentPrizes
            .FirstOrDefaultAsync(
                x => x.Id == prizeId && x.TournamentId == tournamentId,
                cancellationToken);

        if (prize == null)
        {
            return NotFound(new
            {
                message = "Приз не найден"
            });
        }

        var place = request.Place.Trim();

        var placeBusy = await _dbContext.TournamentPrizes
            .AnyAsync(
                x => x.TournamentId == tournamentId &&
                     x.Id != prizeId &&
                     x.Place == place,
                cancellationToken);

        if (placeBusy)
        {
            return BadRequest(new
            {
                message = "Приз для этого места уже существует"
            });
        }

        prize.Place = place;
        prize.Amount = request.Amount;
        prize.Type = request.Type.Trim();
        prize.Text = NormalizeNullable(request.Text);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Приз обновлён",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpPut("{tournamentId:int}/registrations/{registrationId:int}/confirm")]
    public async Task<IActionResult> ConfirmRegistration(
    [FromRoute] int tournamentId,
    [FromRoute] int registrationId,
    [FromBody] AdminTournamentRegistrationReviewRequest request,
    CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        var registration = await _dbContext.TournamentRegistrations
            .Include(x => x.Players)
            .FirstOrDefaultAsync(
                x => x.Id == registrationId && x.TournamentId == tournamentId,
                cancellationToken);

        if (registration == null)
        {
            return NotFound(new
            {
                message = "Заявка не найдена"
            });
        }

        if (registration.Status == TournamentRegistrationStatus.Rejected)
        {
            return BadRequest(new
            {
                message = "Отклонённую заявку нельзя принять"
            });
        }

        registration.Status = TournamentRegistrationStatus.Confirmed;
        registration.ReviewedAtUtc = DateTime.UtcNow;
        registration.ReviewedByUserId = adminId;
        registration.ReviewComment = NormalizeNullable(request.Comment);

        foreach (var player in registration.Players)
        {
            player.BlocksNickname = true;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Заявка принята",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpPut("{tournamentId:int}/registrations/{registrationId:int}/reject")]
    public async Task<IActionResult> RejectRegistration(
    [FromRoute] int tournamentId,
    [FromRoute] int registrationId,
    [FromBody] AdminTournamentRegistrationReviewRequest request,
    CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        var registration = await _dbContext.TournamentRegistrations
            .Include(x => x.Players)
            .FirstOrDefaultAsync(
                x => x.Id == registrationId && x.TournamentId == tournamentId,
                cancellationToken);

        if (registration == null)
        {
            return NotFound(new
            {
                message = "Заявка не найдена"
            });
        }

        if (registration.Status == TournamentRegistrationStatus.Confirmed)
        {
            return BadRequest(new
            {
                message = "Принятую заявку нельзя отклонить"
            });
        }

        registration.Status = TournamentRegistrationStatus.Rejected;
        registration.ReviewedAtUtc = DateTime.UtcNow;
        registration.ReviewedByUserId = adminId;
        registration.ReviewComment = NormalizeNullable(request.Comment);

        foreach (var player in registration.Players)
        {
            player.BlocksNickname = false;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Заявка отклонена",
            tournament = ToResponse(tournament!)
        });
    }

    [HttpDelete("{tournamentId:int}/prizes/{prizeId:int}")]
    public async Task<IActionResult> DeletePrize(
        [FromRoute] int tournamentId,
        [FromRoute] int prizeId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var prize = await _dbContext.TournamentPrizes
            .FirstOrDefaultAsync(
                x => x.Id == prizeId && x.TournamentId == tournamentId,
                cancellationToken);

        if (prize == null)
        {
            return NotFound(new
            {
                message = "Приз не найден"
            });
        }

        _dbContext.TournamentPrizes.Remove(prize);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var tournament = await LoadTournamentAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Приз удалён",
            tournament = ToResponse(tournament!)
        });
    }

    private async Task<Tournament?> LoadTournamentAsync(
        int id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Tournaments
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.Event)
            .Include(x => x.Maps)
            .Include(x => x.Prizes)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.User)
            .Include(x => x.Registrations)
                .ThenInclude(x => x.Players)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    private async Task<string?> ValidateTournamentRequestAsync(
        AdminTournamentRequest request,
        int? currentTournamentId,
        CancellationToken cancellationToken)
    {
        if (request.DateEnd.Date < request.DateStart.Date)
        {
            return "Дата окончания турнира не может быть раньше даты начала";
        }

        if (request.RegEnd.Date < request.RegStart.Date)
        {
            return "Дата окончания регистрации не может быть раньше даты начала регистрации";
        }

        if (request.TeamSize <= 0)
        {
            return "Размер команды должен быть больше 0";
        }

        if (request.ReserveSize < 0)
        {
            return "Количество запасных не может быть меньше 0";
        }

        if (request.MaxParticipants.HasValue &&
            request.MaxParticipants.Value < request.InitialParticipants)
        {
            return "Максимальное количество участников не может быть меньше начального количества участников";
        }

        if (request.EventId.HasValue)
        {
            var eventExists = await _dbContext.InfoItems
                .AnyAsync(
                    x => x.Id == request.EventId.Value &&
                         x.Type == InfoItemType.Event,
                    cancellationToken);

            if (!eventExists)
            {
                return "Указанное событие не найдено";
            }
        }

        return null;
    }

    private static AdminTournamentResponse ToResponse(Tournament tournament)
    {
        var registrations = tournament.Registrations ?? [];

        var culture = CultureInfo.GetCultureInfo("ru-RU");
        var registrationsCount = tournament.Registrations?.Count ?? 0;

        var activeRegistrationsCount = tournament.Registrations?
            .Count(x => x.Status is TournamentRegistrationStatus.Sent
                     or TournamentRegistrationStatus.Confirmed) ?? 0;

        return new AdminTournamentResponse
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
            InitialParticipants = tournament.InitialParticipants,
            RegistrationsCount = registrationsCount,
            CurrentParticipants = tournament.InitialParticipants + activeRegistrationsCount,
            Classes = tournament.Classes,
            Status = tournament.Status,
            IsStream = tournament.IsStream,
            StreamUrl = tournament.StreamUrl,
            DateStart = tournament.DateStart.ToString("d MMMM yyyy", culture),
            DateEnd = tournament.DateEnd.ToString("d MMMM yyyy", culture),
            DateStartISO = tournament.DateStart.ToString("yyyy-MM-dd"),
            DateEndISO = tournament.DateEnd.ToString("yyyy-MM-dd"),
            RegStart = tournament.RegStart.ToString("d MMMM yyyy", culture),
            RegEnd = tournament.RegEnd.ToString("d MMMM yyyy", culture),
            RegStartISO = tournament.RegStart.ToString("yyyy-MM-dd"),
            RegEndISO = tournament.RegEnd.ToString("yyyy-MM-dd"),
            OpenForAll = tournament.OpenForAll,
            Sponsor = tournament.Sponsor,
            PrizeText = tournament.PrizeText,
            IsPublished = tournament.IsPublished,
            EventId = tournament.EventId,
            EventTitle = tournament.Event?.Title,
            CreatedAtUtc = tournament.CreatedAtUtc,
            CreatedAt = tournament.CreatedAtUtc.ToString("d MMMM yyyy HH:mm", culture),
            Maps = tournament.Maps
                .OrderBy(x => x.Id)
                .Select(x => new AdminTournamentMapResponse
                {
                    Id = x.Id,
                    TournamentId = x.TournamentId,
                    Name = x.Name,
                    Image = x.Image
                })
                .ToArray(),
            Prizes = tournament.Prizes
                .OrderBy(x => GetPrizeOrder(x.Place))
                .ThenBy(x => x.Id)
                .Select(x => new AdminTournamentPrizeResponse
                {
                    Id = x.Id,
                    TournamentId = x.TournamentId,
                    Place = x.Place,
                    PlaceLabel = GetPrizePlaceLabel(x.Place),
                    Amount = x.Amount,
                    Type = x.Type,
                    Text = x.Text
                })
                .ToArray(),
            Registrations = registrations
    .OrderByDescending(x => x.RegisteredAtUtc)
    .Select(x =>
    {
        var captainNickname = x.User?.Nickname ?? "Пользователь не найден";

        return new AdminTournamentRegistrationResponse
        {
            Id = x.Id,
            TournamentId = x.TournamentId,
            UserId = x.AppUserId,
            CaptainNickname = captainNickname,
            CaptainEmail = x.User?.Email,
            TeamName = !string.IsNullOrWhiteSpace(x.TeamName)
                ? x.TeamName
                : captainNickname,
            Contact = x.Contact,
            Comment = x.Comment,

            Status = x.Status.ToString(),
            StatusLabel = GetRegistrationStatusLabel(x.Status),

            ReviewComment = x.ReviewComment,
            ReviewedAtUtc = x.ReviewedAtUtc,
            ReviewedAt = x.ReviewedAtUtc.HasValue
                ? x.ReviewedAtUtc.Value.ToString("d MMMM yyyy HH:mm", culture)
                : null,

            RegisteredAtUtc = x.RegisteredAtUtc,
            RegisteredAt = x.RegisteredAtUtc.ToString("d MMMM yyyy HH:mm", culture),

            Players = x.Players
                .OrderBy(p => p.SortOrder)
                .Select(p => new AdminTournamentRegistrationPlayerResponse
                {
                    Id = p.Id,
                    Nickname = p.Nickname,
                    Role = p.Role.ToString(),
                    RoleLabel = GetPlayerRoleLabel(p.Role),
                    SortOrder = p.SortOrder
                })
                .ToArray()
        };
    })
    .ToArray()
        };
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

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }

    private static int GetPrizeOrder(string place)
    {
        return place switch
        {
            "place1" => 1,
            "place2" => 2,
            "place3" => 3,
            "others" => 4,
            _ => 99
        };
    }

    private static string GetPrizePlaceLabel(string place)
    {
        return place switch
        {
            "place1" => "1 место",
            "place2" => "2 место",
            "place3" => "3 место",
            "others" => "Остальные",
            _ => place
        };
    }

    private static string GetRegistrationStatusLabel(TournamentRegistrationStatus status)
    {
        return status switch
        {
            TournamentRegistrationStatus.Sent => "На рассмотрении",
            TournamentRegistrationStatus.Confirmed => "Принята",
            TournamentRegistrationStatus.Rejected => "Отклонена",
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
}