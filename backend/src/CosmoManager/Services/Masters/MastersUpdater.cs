using System.Text.Json;
using CosmoManager.Data;
using CosmoManager.Models;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Services.Masters;

public class MastersUpdater
{
    private const string MasteryUrl = "https://poliroid.me/mastery/api/v2/data/ru/vehicles";

    private const string MastersSyncKey = "masters";

    private readonly HttpClient _httpClient;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<MastersUpdater> _logger;

    public MastersUpdater(
        HttpClient httpClient,
        AppDbContext dbContext,
        ILogger<MastersUpdater> logger)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task UpdateAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Начато обновление знаков классности");

            var masteries = await LoadMasteriesAsync(cancellationToken);

            await UpsertMasteriesAsync(masteries, cancellationToken);

            await MarkSyncSuccessAsync(MastersSyncKey, cancellationToken);

            _logger.LogInformation(
                "Обновление знаков классности завершено. Записей: {MasteryCount}",
                masteries.Count);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            await MarkSyncErrorAsync(MastersSyncKey, ex, cancellationToken);

            _logger.LogError(ex, "Ошибка обновления знаков классности");

            throw;
        }
    }

    private async Task<List<VehicleMastery>> LoadMasteriesAsync(CancellationToken cancellationToken)
    {
        var json = await _httpClient.GetStringAsync(MasteryUrl, cancellationToken);

        using var document = JsonDocument.Parse(json);

        var rows = document.RootElement
            .GetProperty("data")
            .GetProperty("data")
            .EnumerateArray();

        var now = DateTime.UtcNow;
        var result = new List<VehicleMastery>();

        foreach (var entry in rows)
        {
            var vehicleId = entry.GetProperty("id").GetInt32();

            if (!entry.TryGetProperty("mastery", out var mastery) ||
                mastery.ValueKind != JsonValueKind.Array)
            {
                _logger.LogWarning(
                    "Для техники {VehicleId} не найден массив mastery",
                    vehicleId);

                continue;
            }

            result.Add(new VehicleMastery
            {
                VehicleId = vehicleId,
                Deg3 = GetNullableArrayInt(mastery, 0),
                Deg2 = GetNullableArrayInt(mastery, 1),
                Deg1 = GetNullableArrayInt(mastery, 2),
                Master = GetNullableArrayInt(mastery, 3),
                UpdatedAtUtc = now
            });
        }

        return result;
    }

    private async Task UpsertMasteriesAsync(
        List<VehicleMastery> masteries,
        CancellationToken cancellationToken)
    {
        if (masteries.Count == 0)
        {
            throw new InvalidOperationException("Poliroid вернул пустой список знаков классности");
        }

        var vehicleIds = masteries
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
                "Часть записей мастерства пропущена, потому что техника ещё не найдена в Vehicles. Пропущено: {Count}",
                missingVehiclesCount);
        }

        var existingMasteries = await _dbContext.VehicleMasteries
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .ToDictionaryAsync(x => x.VehicleId, cancellationToken);

        foreach (var mastery in masteries)
        {
            if (!existingVehicleIdSet.Contains(mastery.VehicleId))
            {
                continue;
            }

            if (existingMasteries.TryGetValue(mastery.VehicleId, out var existing))
            {
                existing.Deg3 = mastery.Deg3;
                existing.Deg2 = mastery.Deg2;
                existing.Deg1 = mastery.Deg1;
                existing.Master = mastery.Master;
                existing.UpdatedAtUtc = mastery.UpdatedAtUtc;
            }
            else
            {
                _dbContext.VehicleMasteries.Add(mastery);
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

    private static int? GetNullableArrayInt(JsonElement array, int index)
    {
        if (array.GetArrayLength() <= index)
        {
            return null;
        }

        var value = array[index];

        return value.ValueKind == JsonValueKind.Null
            ? null
            : value.GetInt32();
    }
}