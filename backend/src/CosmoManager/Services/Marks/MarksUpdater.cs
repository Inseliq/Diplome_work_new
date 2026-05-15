using System.Text.Json;
using CosmoManager.Data;
using CosmoManager.Models;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Services.Marks;

public class MarksUpdater
{
    private const string MarksUrl = "https://poliroid.me/gunmarks/api/v2/data/ru/vehicles/65,85,95,100";

    private const string MarksSyncKey = "marks";

    private readonly HttpClient _httpClient;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<MarksUpdater> _logger;

    public MarksUpdater(
        HttpClient httpClient,
        AppDbContext dbContext,
        ILogger<MarksUpdater> logger)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task UpdateAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Начато обновление отметок на стволах");

            var marks = await LoadMarksAsync(cancellationToken);

            await UpsertMarksAsync(marks, cancellationToken);

            await MarkSyncSuccessAsync(MarksSyncKey, cancellationToken);

            _logger.LogInformation(
                "Обновление отметок завершено. Записей: {MarksCount}",
                marks.Count);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            await MarkSyncErrorAsync(MarksSyncKey, ex, cancellationToken);

            _logger.LogError(ex, "Ошибка обновления отметок на стволах");

            throw;
        }
    }

    private async Task<List<VehicleMark>> LoadMarksAsync(CancellationToken cancellationToken)
    {
        var json = await _httpClient.GetStringAsync(MarksUrl, cancellationToken);

        using var document = JsonDocument.Parse(json);

        var rows = document.RootElement
            .GetProperty("data")
            .GetProperty("data")
            .EnumerateArray();

        var now = DateTime.UtcNow;
        var result = new List<VehicleMark>();

        foreach (var entry in rows)
        {
            var vehicleId = entry.GetProperty("id").GetInt32();

            if (!entry.TryGetProperty("marks", out var marks) ||
                marks.ValueKind != JsonValueKind.Object)
            {
                _logger.LogWarning(
                    "Для техники {VehicleId} не найден объект marks",
                    vehicleId);

                continue;
            }

            result.Add(new VehicleMark
            {
                VehicleId = vehicleId,
                Moe65 = GetNullableInt(marks, "65"),
                Moe85 = GetNullableInt(marks, "85"),
                Moe95 = GetNullableInt(marks, "95"),
                Moe100 = GetNullableInt(marks, "100"),
                UpdatedAtUtc = now
            });
        }

        return result;
    }

    private async Task UpsertMarksAsync(
        List<VehicleMark> marks,
        CancellationToken cancellationToken)
    {
        if (marks.Count == 0)
        {
            throw new InvalidOperationException("Poliroid вернул пустой список отметок");
        }

        var vehicleIds = marks
            .Select(x => x.VehicleId)
            .Distinct()
            .ToArray();

        var existingVehicleIds = await _dbContext.Vehicles
            .Where(x => vehicleIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var existingVehicleIdSet = existingVehicleIds.ToHashSet();

        var missingVehiclesCount = vehicleIds.Length - existingVehicleIdSet.Count;

        if (missingVehiclesCount > 0)
        {
            _logger.LogWarning(
                "Часть отметок пропущена, потому что техника ещё не найдена в Vehicles. Пропущено: {Count}",
                missingVehiclesCount);
        }

        var existingMarks = await _dbContext.VehicleMarks
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .ToDictionaryAsync(x => x.VehicleId, cancellationToken);

        foreach (var mark in marks)
        {
            if (!existingVehicleIdSet.Contains(mark.VehicleId))
            {
                continue;
            }

            if (existingMarks.TryGetValue(mark.VehicleId, out var existing))
            {
                existing.Moe65 = mark.Moe65;
                existing.Moe85 = mark.Moe85;
                existing.Moe95 = mark.Moe95;
                existing.Moe100 = mark.Moe100;
                existing.UpdatedAtUtc = mark.UpdatedAtUtc;
            }
            else
            {
                _dbContext.VehicleMarks.Add(mark);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task MarkSyncSuccessAsync(
        string key,
        CancellationToken cancellationToken)
    {
        var state = await _dbContext.DataSyncStates
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (state == null)
        {
            state = new DataSyncState
            {
                Key = key
            };

            _dbContext.DataSyncStates.Add(state);
        }

        state.LastSuccessAtUtc = DateTime.UtcNow;
        state.LastErrorAtUtc = null;
        state.LastError = null;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task MarkSyncErrorAsync(
        string key,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var state = await _dbContext.DataSyncStates
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (state == null)
        {
            state = new DataSyncState
            {
                Key = key
            };

            _dbContext.DataSyncStates.Add(state);
        }

        state.LastErrorAtUtc = DateTime.UtcNow;
        state.LastError = exception.Message;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static int? GetNullableInt(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind == JsonValueKind.Null
            ? null
            : property.GetInt32();
    }
}