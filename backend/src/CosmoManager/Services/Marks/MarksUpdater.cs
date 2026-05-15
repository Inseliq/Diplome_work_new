using System.Text.Json;
using CosmoManager.Data;
using CosmoManager.Models;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Services.Marks;

public class MarksUpdater
{
    private const string MarksUrl = "https://poliroid.me/gunmarks/api/v2/data/ru/vehicles/65,85,95,100";
    private const string VehiclesUrl = "https://poliroid.me/gunmarks/api/v2/vehicles/ru/ru";

    private const string VehiclesSyncKey = "vehicles";
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
            _logger.LogInformation("Начато обновление танков и отметок");

            var vehicles = await LoadVehiclesAsync(cancellationToken);
            await UpsertVehiclesAsync(vehicles, cancellationToken);

            var marks = await LoadMarksAsync(cancellationToken);
            await UpsertMarksAsync(marks, cancellationToken);

            await MarkSyncSuccessAsync(VehiclesSyncKey, cancellationToken);
            await MarkSyncSuccessAsync(MarksSyncKey, cancellationToken);

            _logger.LogInformation(
                "Обновление завершено. Танков: {VehicleCount}, отметок: {MarksCount}",
                vehicles.Count,
                marks.Count);
        }
        catch (Exception ex)
        {
            await MarkSyncErrorAsync(MarksSyncKey, ex, cancellationToken);

            _logger.LogError(ex, "Ошибка обновления танков и отметок");

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
            var marks = entry.GetProperty("marks");

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

    private async Task UpsertVehiclesAsync(
        List<Vehicle> vehicles,
        CancellationToken cancellationToken)
    {
        if (vehicles.Count == 0)
        {
            throw new InvalidOperationException("Poliroid вернул пустой список танков");
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

    private async Task UpsertMarksAsync(
        List<VehicleMark> marks,
        CancellationToken cancellationToken)
    {
        if (marks.Count == 0)
        {
            throw new InvalidOperationException("Poliroid вернул пустой список отметок");
        }

        var vehicleIds = marks.Select(x => x.VehicleId).ToArray();

        var existingMarks = await _dbContext.VehicleMarks
            .Where(x => vehicleIds.Contains(x.VehicleId))
            .ToDictionaryAsync(x => x.VehicleId, cancellationToken);

        var existingVehicleIds = await _dbContext.Vehicles
            .Where(x => vehicleIds.Contains(x.Id))
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        var existingVehicleIdSet = existingVehicleIds.ToHashSet();

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