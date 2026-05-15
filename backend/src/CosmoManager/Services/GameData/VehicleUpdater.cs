using System.Text.Json;
using CosmoManager.Data;
using CosmoManager.Models;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Services.GameData;

public class VehicleUpdater
{
    private const string VehiclesUrl = "https://poliroid.me/gunmarks/api/v2/vehicles/ru/ru";
    private const string VehiclesSyncKey = "vehicles";

    private readonly HttpClient _httpClient;
    private readonly AppDbContext _dbContext;
    private readonly ILogger<VehicleUpdater> _logger;

    public VehicleUpdater(
        HttpClient httpClient,
        AppDbContext dbContext,
        ILogger<VehicleUpdater> logger)
    {
        _httpClient = httpClient;
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task UpdateAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            _logger.LogInformation("Начато обновление справочника техники");

            var vehicles = await LoadVehiclesAsync(cancellationToken);
            await UpsertVehiclesAsync(vehicles, cancellationToken);
            await MarkSyncSuccessAsync(VehiclesSyncKey, cancellationToken);

            _logger.LogInformation(
                "Обновление техники завершено. Танков: {Count}",
                vehicles.Count);
        }
        catch (Exception ex)
        {
            await MarkSyncErrorAsync(VehiclesSyncKey, ex, cancellationToken);

            _logger.LogError(ex, "Ошибка обновления справочника техники");

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
            result.Add(new Vehicle
            {
                Id = row[0].GetInt32(),
                InternalName = GetString(row, 1).ToLowerInvariant(),
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