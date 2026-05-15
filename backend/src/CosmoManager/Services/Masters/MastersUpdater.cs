using System.Text.Json;
using CosmoManager.Data;
using CosmoManager.Models;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Services.Masters;

public class MastersUpdater
{
    private const string MasteryUrl = "https://poliroid.me/mastery/api/v2/data/ru/vehicles";
    private const string VehiclesUrl = "https://poliroid.me/mastery/api/v2/vehicles/ru/ru";

    private const string VehiclesSyncKey = "vehicles";
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
            _logger.LogInformation("Начато обновление техники и знаков классности");

            var vehicles = await LoadVehiclesAsync(cancellationToken);
            await UpsertVehiclesAsync(vehicles, cancellationToken);
            await MarkSyncSuccessAsync(VehiclesSyncKey, cancellationToken);

            var masteries = await LoadMasteriesAsync(cancellationToken);
            await UpsertMasteriesAsync(masteries, cancellationToken);
            await MarkSyncSuccessAsync(MastersSyncKey, cancellationToken);

            _logger.LogInformation(
                "Обновление знаков классности завершено. Танков: {VehicleCount}, записей мастерства: {MasteryCount}",
                vehicles.Count,
                masteries.Count);
        }
        catch (Exception ex)
        {
            await MarkSyncErrorAsync(MastersSyncKey, ex, cancellationToken);

            _logger.LogError(ex, "Ошибка обновления знаков классности");

            throw;
        }
    }

    private async Task<List<Vehicle>> LoadVehiclesAsync(CancellationToken cancellationToken)
    {
        var json = await _httpClient.GetStringAsync(VehiclesUrl, cancellationToken);

        using var document = JsonDocument.Parse(json);

        var rows = document.RootElement
            .GetProperty("data")
            .GetProperty("data")
            .GetProperty("vehicles")
            .EnumerateArray();

        var now = DateTime.UtcNow;
        var result = new List<Vehicle>();

        foreach (var row in rows)
        {
            var id = row[0].GetInt32();

            result.Add(new Vehicle
            {
                Id = id,
                InternalName = GetString(row, 1),
                Nation = GetString(row, 2),
                Type = GetString(row, 3),
                Tier = row[4].GetInt32(),
                Name = GetString(row, 5),
                ShortName = GetString(row, 6),
                IsTechTree = GetBool(row, 7),
                IsPremium = GetBool(row, 8),
                IsSpecial = GetBool(row, 9),
                IsCollector = GetBool(row, 10),
                Role = row.GetArrayLength() > 12 ? GetString(row, 12) : string.Empty,
                UpdatedAtUtc = now
            });
        }

        return result;
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

    private async Task UpsertVehiclesAsync(
        List<Vehicle> vehicles,
        CancellationToken cancellationToken)
    {
        if (vehicles.Count == 0)
        {
            throw new InvalidOperationException("Poliroid вернул пустой список техники");
        }

        var ids = vehicles.Select(x => x.Id).ToArray();

        var existingVehicles = await _dbContext.Vehicles
            .Where(x => ids.Contains(x.Id))
            .ToDictionaryAsync(x => x.Id, cancellationToken);

        foreach (var vehicle in vehicles)
        {
            if (existingVehicles.TryGetValue(vehicle.Id, out var existing))
            {
                existing.InternalName = vehicle.InternalName;
                existing.Nation = vehicle.Nation;
                existing.Type = vehicle.Type;
                existing.Tier = vehicle.Tier;
                existing.Name = vehicle.Name;
                existing.ShortName = vehicle.ShortName;
                existing.IsTechTree = vehicle.IsTechTree;
                existing.IsPremium = vehicle.IsPremium;
                existing.IsSpecial = vehicle.IsSpecial;
                existing.IsCollector = vehicle.IsCollector;
                existing.Role = vehicle.Role;
                existing.UpdatedAtUtc = vehicle.UpdatedAtUtc;
            }
            else
            {
                _dbContext.Vehicles.Add(vehicle);
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task UpsertMasteriesAsync(
        List<VehicleMastery> masteries,
        CancellationToken cancellationToken)
    {
        if (masteries.Count == 0)
        {
            throw new InvalidOperationException("Poliroid вернул пустой список знаков классности");
        }

        var vehicleIds = masteries.Select(x => x.VehicleId).ToArray();

        var existingMasteries = await _dbContext.VehicleMasteries
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .ToDictionaryAsync(x => x.VehicleId, cancellationToken);

        var existingVehicleIds = await _dbContext.Vehicles
            .Where(x => vehicleIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var existingVehicleIdSet = existingVehicleIds.ToHashSet();

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

    private static string GetString(JsonElement row, int index)
    {
        if (row.GetArrayLength() <= index)
        {
            return string.Empty;
        }

        return row[index].ValueKind == JsonValueKind.String
            ? row[index].GetString() ?? string.Empty
            : row[index].ToString();
    }

    private static bool GetBool(JsonElement row, int index)
    {
        if (row.GetArrayLength() <= index)
        {
            return false;
        }

        var value = row[index];

        return value.ValueKind switch
        {
            JsonValueKind.True => true,
            JsonValueKind.False => false,
            JsonValueKind.Number => value.GetInt32() == 1,
            JsonValueKind.String => value.GetString() == "1" || value.GetString()?.ToLower() == "true",
            _ => false
        };
    }
}