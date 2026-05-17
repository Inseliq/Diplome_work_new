using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests.Admin;
using CosmoManager.Requests.Tournaments;
using CosmoManager.Responses.Admin;
using CosmoManager.Responses.Tournaments;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers.Admin;

[ApiController]
[Route("api/admin/tournament-matches")]
[Authorize]
public class AdminTournamentMatchesController : ControllerBase
{
    private static readonly string[] AllowedBrackets =
    [
        "upper",
        "lower",
        "final",
        "grandFinal"
    ];

    private static readonly string[] AllowedStatuses =
    [
        "scheduled",
        "live",
        "finished",
        "cancelled"
    ];

    private static readonly string[] AllowedResultStatuses =
    [
        "pending",
        "team1_win",
        "team2_win",
        "draw",
        "tech_team1",
        "tech_team2"
    ];

    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public AdminTournamentMatchesController(
        AppDbContext dbContext,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    [HttpGet("tournaments")]
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
            .Include(x => x.Registrations)
            .Include(x => x.Matches)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();

            query = query.Where(x =>
                x.Name.ToLower().Contains(normalized) ||
                x.Format.ToLower().Contains(normalized) ||
                x.Status.ToLower().Contains(normalized));
        }

        var tournaments = await query
            .OrderByDescending(x => x.Matches.Count)
            .ThenByDescending(x => x.CreatedAtUtc)
            .Take(100)
            .ToListAsync(cancellationToken);

        var response = tournaments.Select(x => new AdminMatchTournamentResponse
        {
            Id = x.Id,
            Name = x.Name,
            Status = x.Status,
            Format = x.Format,
            TeamSize = x.TeamSize,
            ReserveSize = x.ReserveSize,
            MaxParticipants = x.MaxParticipants,
            RegistrationsCount = x.Registrations.Count,
            CurrentParticipants = x.InitialParticipants + x.Registrations.Count,
            MatchesCount = x.Matches.Count,
            HasMatches = x.Matches.Count > 0,
            IsPublished = x.IsPublished
        });

        return Ok(response);
    }

    [HttpGet("tournaments/{tournamentId:int}/registrations")]
    public async Task<IActionResult> GetRegistrationOptions(
        [FromRoute] int tournamentId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var tournamentExists = await _dbContext.Tournaments
            .AsNoTracking()
            .AnyAsync(x => x.Id == tournamentId, cancellationToken);

        if (!tournamentExists)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        var registrations = await _dbContext.TournamentRegistrations
            .AsNoTracking()
            .Include(x => x.User)
            .Where(x => x.TournamentId == tournamentId)
            .OrderBy(x => x.TeamName)
            .ThenBy(x => x.User.Nickname)
            .Select(x => new TournamentRegistrationOptionResponse
            {
                RegistrationId = x.Id,
                TournamentId = x.TournamentId,
                TeamName = !string.IsNullOrWhiteSpace(x.TeamName)
                    ? x.TeamName
                    : x.User.Nickname,
                CaptainNickname = x.User.Nickname,
                Contact = x.Contact,
                RegisteredAtUtc = x.RegisteredAtUtc
            })
            .ToListAsync(cancellationToken);

        return Ok(registrations);
    }

    [HttpGet("tournaments/{tournamentId:int}/matches")]
    public async Task<IActionResult> GetMatches(
        [FromRoute] int tournamentId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var tournamentExists = await _dbContext.Tournaments
            .AsNoTracking()
            .AnyAsync(x => x.Id == tournamentId, cancellationToken);

        if (!tournamentExists)
        {
            return NotFound(new
            {
                message = "Турнир не найден"
            });
        }

        var matches = await LoadMatchesAsync(tournamentId, cancellationToken);

        return Ok(matches.Select(ToMatchResponse).ToList());
    }

    [HttpGet("tournaments/{tournamentId:int}/matches/{matchId:int}")]
    public async Task<IActionResult> GetMatch(
        [FromRoute] int tournamentId,
        [FromRoute] int matchId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var match = await LoadMatchAsync(tournamentId, matchId, cancellationToken);

        if (match == null)
        {
            return NotFound(new
            {
                message = "Матч не найден"
            });
        }

        return Ok(ToMatchResponse(match));
    }

    [HttpPost("tournaments/{tournamentId:int}/matches")]
    public async Task<IActionResult> CreateMatch(
        [FromRoute] int tournamentId,
        [FromBody] AdminTournamentMatchRequest request,
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

        var validationError = await ValidateMatchRequestAsync(
            tournamentId,
            request,
            currentMatchId: null,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        var match = new TournamentMatch
        {
            TournamentId = tournamentId,
            Bracket = request.Bracket.Trim(),
            RoundSize = request.RoundSize,
            RoundNumber = request.RoundNumber,
            MatchNumber = request.MatchNumber,
            Status = request.Status.Trim(),
            ResultStatus = "pending",
            WinnerToMatchId = request.WinnerToMatchId,
            WinnerToSlotNumber = request.WinnerToSlotNumber,
            LoserToMatchId = request.LoserToMatchId,
            LoserToSlotNumber = request.LoserToSlotNumber,
            ScheduledAtUtc = ToUtc(request.ScheduledAtUtc),
            StreamUrl = NormalizeNullable(request.StreamUrl),
            Comment = NormalizeNullable(request.Comment),
            CreatedAtUtc = DateTime.UtcNow
        };

        match.Slots.Add(CreateSlot(request.Slot1, 1));
        match.Slots.Add(CreateSlot(request.Slot2, 2));

        _dbContext.TournamentMatches.Add(match);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var matches = await LoadMatchesAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Матч создан",
            matches = matches.Select(ToMatchResponse).ToList()
        });
    }

    [HttpPut("tournaments/{tournamentId:int}/matches/{matchId:int}")]
    public async Task<IActionResult> UpdateMatch(
        [FromRoute] int tournamentId,
        [FromRoute] int matchId,
        [FromBody] AdminTournamentMatchRequest request,
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

        var match = await _dbContext.TournamentMatches
            .Include(x => x.Slots)
            .FirstOrDefaultAsync(
                x => x.Id == matchId && x.TournamentId == tournamentId,
                cancellationToken);

        if (match == null)
        {
            return NotFound(new
            {
                message = "Матч не найден"
            });
        }

        var validationError = await ValidateMatchRequestAsync(
            tournamentId,
            request,
            currentMatchId: matchId,
            cancellationToken);

        if (validationError != null)
        {
            return BadRequest(new
            {
                message = validationError
            });
        }

        match.Bracket = request.Bracket.Trim();
        match.RoundSize = request.RoundSize;
        match.RoundNumber = request.RoundNumber;
        match.MatchNumber = request.MatchNumber;
        match.Status = request.Status.Trim();
        match.WinnerToMatchId = request.WinnerToMatchId;
        match.WinnerToSlotNumber = request.WinnerToSlotNumber;
        match.LoserToMatchId = request.LoserToMatchId;
        match.LoserToSlotNumber = request.LoserToSlotNumber;
        match.ScheduledAtUtc = ToUtc(request.ScheduledAtUtc);
        match.StreamUrl = NormalizeNullable(request.StreamUrl);
        match.Comment = NormalizeNullable(request.Comment);

        ApplySlot(match, request.Slot1, 1);
        ApplySlot(match, request.Slot2, 2);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var matches = await LoadMatchesAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Матч обновлён",
            matches = matches.Select(ToMatchResponse).ToList()
        });
    }

    [HttpPut("tournaments/{tournamentId:int}/matches/{matchId:int}/result")]
    public async Task<IActionResult> UpdateResult(
        [FromRoute] int tournamentId,
        [FromRoute] int matchId,
        [FromBody] UpdateTournamentMatchResultRequest request,
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

        if (!AllowedStatuses.Contains(request.Status))
        {
            return BadRequest(new
            {
                message = "Некорректный статус матча"
            });
        }

        if (!AllowedResultStatuses.Contains(request.ResultStatus))
        {
            return BadRequest(new
            {
                message = "Некорректный результат матча"
            });
        }

        if (request.Team1Score < 0 || request.Team2Score < 0)
        {
            return BadRequest(new
            {
                message = "Счёт не может быть меньше 0"
            });
        }

        var match = await _dbContext.TournamentMatches
            .Include(x => x.Slots)
                .ThenInclude(x => x.Registration)
            .FirstOrDefaultAsync(
                x => x.Id == matchId && x.TournamentId == tournamentId,
                cancellationToken);

        if (match == null)
        {
            return NotFound(new
            {
                message = "Матч не найден"
            });
        }

        var slot1 = match.Slots.FirstOrDefault(x => x.SlotNumber == 1);
        var slot2 = match.Slots.FirstOrDefault(x => x.SlotNumber == 2);

        if (slot1 == null || slot2 == null)
        {
            return BadRequest(new
            {
                message = "У матча должны быть два слота"
            });
        }

        var slot1RegistrationId = slot1.RegistrationId;
        var slot2RegistrationId = slot2.RegistrationId;

        int? winnerRegistrationId = null;
        int? advancingRegistrationId = null;
        int? loserRegistrationId = null;

        switch (request.ResultStatus)
        {
            case "pending":
                winnerRegistrationId = null;
                advancingRegistrationId = null;
                loserRegistrationId = null;
                break;

            case "team1_win":
            case "tech_team1":
                if (slot1RegistrationId == null)
                {
                    return BadRequest(new
                    {
                        message = "В первом слоте нет команды"
                    });
                }

                winnerRegistrationId = slot1RegistrationId;
                advancingRegistrationId = slot1RegistrationId;
                loserRegistrationId = slot2RegistrationId;
                break;

            case "team2_win":
            case "tech_team2":
                if (slot2RegistrationId == null)
                {
                    return BadRequest(new
                    {
                        message = "Во втором слоте нет команды"
                    });
                }

                winnerRegistrationId = slot2RegistrationId;
                advancingRegistrationId = slot2RegistrationId;
                loserRegistrationId = slot1RegistrationId;
                break;

            case "draw":
                if (request.AdvancingRegistrationId == null)
                {
                    return BadRequest(new
                    {
                        message = "При ничьей нужно вручную выбрать команду, которая проходит дальше"
                    });
                }

                var validAdvancing =
                    request.AdvancingRegistrationId == slot1RegistrationId ||
                    request.AdvancingRegistrationId == slot2RegistrationId;

                if (!validAdvancing)
                {
                    return BadRequest(new
                    {
                        message = "Проходящая команда должна быть одной из команд матча"
                    });
                }

                winnerRegistrationId = null;
                advancingRegistrationId = request.AdvancingRegistrationId;
                loserRegistrationId = request.AdvancingRegistrationId == slot1RegistrationId
                    ? slot2RegistrationId
                    : slot1RegistrationId;
                break;
        }

        match.Team1Score = request.Team1Score;
        match.Team2Score = request.Team2Score;
        match.ResultStatus = request.ResultStatus;
        match.Status = request.Status;
        match.WinnerRegistrationId = winnerRegistrationId;
        match.AdvancingRegistrationId = advancingRegistrationId;

        if (request.Status == "live" && match.StartedAtUtc == null)
        {
            match.StartedAtUtc = DateTime.UtcNow;
        }

        if (request.Status == "finished" && match.FinishedAtUtc == null)
        {
            match.FinishedAtUtc = DateTime.UtcNow;
        }

        if (request.Status is "scheduled" or "cancelled")
        {
            match.FinishedAtUtc = null;
        }

        await PropagateResultAsync(
            match,
            advancingRegistrationId,
            loserRegistrationId,
            cancellationToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var matches = await LoadMatchesAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Результат матча обновлён",
            matches = matches.Select(ToMatchResponse).ToList()
        });
    }

    [HttpDelete("tournaments/{tournamentId:int}/matches/{matchId:int}")]
    public async Task<IActionResult> DeleteMatch(
        [FromRoute] int tournamentId,
        [FromRoute] int matchId,
        CancellationToken cancellationToken)
    {
        if (!await IsAdminAsync())
        {
            return Forbidden();
        }

        var match = await _dbContext.TournamentMatches
            .FirstOrDefaultAsync(
                x => x.Id == matchId && x.TournamentId == tournamentId,
                cancellationToken);

        if (match == null)
        {
            return NotFound(new
            {
                message = "Матч не найден"
            });
        }

        var usedAsSource = await _dbContext.TournamentMatchSlots
            .AnyAsync(x => x.SourceMatchId == matchId, cancellationToken);

        var usedAsTarget = await _dbContext.TournamentMatches
            .AnyAsync(
                x => x.WinnerToMatchId == matchId ||
                     x.LoserToMatchId == matchId,
                cancellationToken);

        if (usedAsSource || usedAsTarget)
        {
            return BadRequest(new
            {
                message = "Матч используется в связях сетки. Сначала уберите ссылки на него из других матчей."
            });
        }

        _dbContext.TournamentMatches.Remove(match);

        await _dbContext.SaveChangesAsync(cancellationToken);

        var matches = await LoadMatchesAsync(tournamentId, cancellationToken);

        return Ok(new
        {
            message = "Матч удалён",
            matches = matches.Select(ToMatchResponse).ToList()
        });
    }

    private async Task<List<TournamentMatch>> LoadMatchesAsync(
    int tournamentId,
    CancellationToken cancellationToken)
    {
        var matches = await _dbContext.TournamentMatches
            .AsNoTracking()
            .AsSplitQuery()
            .Include(x => x.Slots)
                .ThenInclude(x => x.Registration)
                    .ThenInclude(x => x.User)
            .Where(x => x.TournamentId == tournamentId)
            .ToListAsync(cancellationToken);

        return matches
            .OrderBy(x => GetBracketOrder(x.Bracket))
            .ThenByDescending(x => x.RoundSize)
            .ThenBy(x => x.RoundNumber)
            .ThenBy(x => x.MatchNumber)
            .ToList();
    }

    private async Task<TournamentMatch?> LoadMatchAsync(
        int tournamentId,
        int matchId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.TournamentMatches
            .AsNoTracking()
            .Include(x => x.Slots)
                .ThenInclude(x => x.Registration)
                    .ThenInclude(x => x.User)
            .FirstOrDefaultAsync(
                x => x.Id == matchId && x.TournamentId == tournamentId,
                cancellationToken);
    }

    private async Task<string?> ValidateMatchRequestAsync(
        int tournamentId,
        AdminTournamentMatchRequest request,
        int? currentMatchId,
        CancellationToken cancellationToken)
    {
        var tournamentExists = await _dbContext.Tournaments
            .AnyAsync(x => x.Id == tournamentId, cancellationToken);

        if (!tournamentExists)
        {
            return "Турнир не найден";
        }

        if (!AllowedBrackets.Contains(request.Bracket))
        {
            return "Некорректная сетка матча";
        }

        if (!AllowedStatuses.Contains(request.Status))
        {
            return "Некорректный статус матча";
        }

        if (request.RoundSize < 2)
        {
            return "Размер раунда должен быть не меньше 2";
        }

        var positionBusy = await _dbContext.TournamentMatches
            .AnyAsync(
                x => x.TournamentId == tournamentId &&
                     x.Bracket == request.Bracket &&
                     x.RoundSize == request.RoundSize &&
                     x.RoundNumber == request.RoundNumber &&
                     x.MatchNumber == request.MatchNumber &&
                     (!currentMatchId.HasValue || x.Id != currentMatchId.Value),
                cancellationToken);

        if (positionBusy)
        {
            return "Матч с такой позицией в сетке уже существует";
        }

        var slotError = await ValidateSlotRequestAsync(
            tournamentId,
            request.Slot1,
            currentMatchId,
            cancellationToken);

        if (slotError != null)
        {
            return $"Слот 1: {slotError}";
        }

        slotError = await ValidateSlotRequestAsync(
            tournamentId,
            request.Slot2,
            currentMatchId,
            cancellationToken);

        if (slotError != null)
        {
            return $"Слот 2: {slotError}";
        }

        var winnerTargetError = await ValidateTargetMatchAsync(
            tournamentId,
            request.WinnerToMatchId,
            request.WinnerToSlotNumber,
            cancellationToken);

        if (winnerTargetError != null)
        {
            return $"Победитель: {winnerTargetError}";
        }

        var loserTargetError = await ValidateTargetMatchAsync(
            tournamentId,
            request.LoserToMatchId,
            request.LoserToSlotNumber,
            cancellationToken);

        if (loserTargetError != null)
        {
            return $"Проигравший: {loserTargetError}";
        }

        return null;
    }

    private async Task<string?> ValidateSlotRequestAsync(
        int tournamentId,
        AdminTournamentMatchSlotRequest slot,
        int? currentMatchId,
        CancellationToken cancellationToken)
    {
        if (slot.IsBye)
        {
            return null;
        }

        if (slot.RegistrationId.HasValue && slot.SourceMatchId.HasValue)
        {
            return "нельзя одновременно выбрать команду и источник из другого матча";
        }

        if (slot.RegistrationId.HasValue)
        {
            var registrationExists = await _dbContext.TournamentRegistrations
                .AnyAsync(
                    x => x.Id == slot.RegistrationId.Value &&
                         x.TournamentId == tournamentId,
                    cancellationToken);

            if (!registrationExists)
            {
                return "выбранная команда не относится к этому турниру";
            }
        }

        if (slot.SourceMatchId.HasValue)
        {
            if (currentMatchId.HasValue && slot.SourceMatchId.Value == currentMatchId.Value)
            {
                return "матч не может ссылаться сам на себя";
            }

            var sourceMatchExists = await _dbContext.TournamentMatches
                .AnyAsync(
                    x => x.Id == slot.SourceMatchId.Value &&
                         x.TournamentId == tournamentId,
                    cancellationToken);

            if (!sourceMatchExists)
            {
                return "исходный матч не найден";
            }

            if (slot.SourceResult is not "winner" and not "loser")
            {
                return "для источника нужно указать winner или loser";
            }
        }

        return null;
    }

    private async Task<string?> ValidateTargetMatchAsync(
        int tournamentId,
        int? targetMatchId,
        int? slotNumber,
        CancellationToken cancellationToken)
    {
        if (targetMatchId == null && slotNumber == null)
        {
            return null;
        }

        if (targetMatchId == null || slotNumber == null)
        {
            return "нужно указать и матч назначения, и слот назначения";
        }

        if (slotNumber is not 1 and not 2)
        {
            return "слот назначения может быть только 1 или 2";
        }

        var targetExists = await _dbContext.TournamentMatches
            .AnyAsync(
                x => x.Id == targetMatchId.Value &&
                     x.TournamentId == tournamentId,
                cancellationToken);

        if (!targetExists)
        {
            return "матч назначения не найден";
        }

        return null;
    }

    private static TournamentMatchSlot CreateSlot(
        AdminTournamentMatchSlotRequest request,
        int slotNumber)
    {
        var slot = new TournamentMatchSlot
        {
            SlotNumber = slotNumber
        };

        FillSlot(slot, request);

        return slot;
    }

    private void ApplySlot(
        TournamentMatch match,
        AdminTournamentMatchSlotRequest request,
        int slotNumber)
    {
        var slot = match.Slots.FirstOrDefault(x => x.SlotNumber == slotNumber);

        if (slot == null)
        {
            slot = new TournamentMatchSlot
            {
                MatchId = match.Id,
                SlotNumber = slotNumber
            };

            _dbContext.TournamentMatchSlots.Add(slot);
        }

        FillSlot(slot, request);
    }

    private static void FillSlot(
        TournamentMatchSlot slot,
        AdminTournamentMatchSlotRequest request)
    {
        slot.IsBye = request.IsBye;
        slot.SeedNumber = request.SeedNumber;

        if (request.IsBye)
        {
            slot.RegistrationId = null;
            slot.SourceMatchId = null;
            slot.SourceResult = null;
            return;
        }

        slot.RegistrationId = request.RegistrationId;
        slot.SourceMatchId = request.SourceMatchId;
        slot.SourceResult = NormalizeNullable(request.SourceResult);
    }

    private async Task PropagateResultAsync(
        TournamentMatch match,
        int? advancingRegistrationId,
        int? loserRegistrationId,
        CancellationToken cancellationToken)
    {
        if (match.WinnerToMatchId.HasValue && match.WinnerToSlotNumber.HasValue)
        {
            await SetTargetSlotAsync(
                match.WinnerToMatchId.Value,
                match.WinnerToSlotNumber.Value,
                advancingRegistrationId,
                match.Id,
                "winner",
                cancellationToken);
        }

        if (match.LoserToMatchId.HasValue && match.LoserToSlotNumber.HasValue)
        {
            await SetTargetSlotAsync(
                match.LoserToMatchId.Value,
                match.LoserToSlotNumber.Value,
                loserRegistrationId,
                match.Id,
                "loser",
                cancellationToken);
        }
    }

    private async Task SetTargetSlotAsync(
        int targetMatchId,
        int targetSlotNumber,
        int? registrationId,
        int sourceMatchId,
        string sourceResult,
        CancellationToken cancellationToken)
    {
        var targetMatch = await _dbContext.TournamentMatches
            .Include(x => x.Slots)
            .FirstOrDefaultAsync(x => x.Id == targetMatchId, cancellationToken);

        if (targetMatch == null)
        {
            return;
        }

        var slot = targetMatch.Slots.FirstOrDefault(x => x.SlotNumber == targetSlotNumber);

        if (slot == null)
        {
            slot = new TournamentMatchSlot
            {
                MatchId = targetMatch.Id,
                SlotNumber = targetSlotNumber
            };

            _dbContext.TournamentMatchSlots.Add(slot);
        }

        slot.RegistrationId = registrationId;
        slot.SourceMatchId = sourceMatchId;
        slot.SourceResult = sourceResult;
        slot.IsBye = false;
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
            ScheduledAt = match.ScheduledAtUtc?.ToString(
                "d MMMM yyyy HH:mm",
                CultureInfo.GetCultureInfo("ru-RU")),
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

        return registration.User?.Nickname ?? "Пользователь не найден";
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

    private static int GetBracketOrder(string bracket)
    {
        return bracket switch
        {
            "upper" => 1,
            "lower" => 2,
            "final" => 3,
            "grandFinal" => 4,
            _ => 99
        };
    }

    private static DateTime? ToUtc(DateTime? value)
    {
        if (value == null)
        {
            return null;
        }

        return value.Value.Kind switch
        {
            DateTimeKind.Utc => value.Value,
            DateTimeKind.Local => value.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
        };
    }

    private static string? NormalizeNullable(string? value)
    {
        return string.IsNullOrWhiteSpace(value)
            ? null
            : value.Trim();
    }
}