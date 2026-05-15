using CosmoManager.Data;
using CosmoManager.Services.Marks;
using CosmoManager.Services.Masters;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Services.GameData;

public class GameDataUpdateHostedService : BackgroundService
{
    private static readonly TimeSpan UpdateInterval = TimeSpan.FromHours(1);
    private static readonly TimeSpan MinimumDataAge = TimeSpan.FromMinutes(55);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<GameDataUpdateHostedService> _logger;

    public GameDataUpdateHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<GameDataUpdateHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await UpdateGameDataSafeAsync(stoppingToken);

        using var timer = new PeriodicTimer(UpdateInterval);

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await UpdateGameDataSafeAsync(stoppingToken);
        }
    }

    private async Task UpdateGameDataSafeAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();

            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var shouldUpdateVehicles = await ShouldUpdateAsync(dbContext, "vehicles", cancellationToken);
            var shouldUpdateMarks = await ShouldUpdateAsync(dbContext, "marks", cancellationToken);
            var shouldUpdateMasters = await ShouldUpdateAsync(dbContext, "masters", cancellationToken);

            if (!shouldUpdateVehicles && !shouldUpdateMarks && !shouldUpdateMasters)
            {
                _logger.LogInformation(
                    "Игровые данные недавно обновлялись. Повторное обновление пропущено.");

                return;
            }

            if (shouldUpdateVehicles)
            {
                var vehicleUpdater = scope.ServiceProvider.GetRequiredService<VehicleUpdater>();

                await vehicleUpdater.UpdateAsync(cancellationToken);

                // Маленькая пауза, чтобы не долбить внешний API подряд.
                await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
            }

            if (shouldUpdateMarks)
            {
                var marksUpdater = scope.ServiceProvider.GetRequiredService<MarksUpdater>();

                await marksUpdater.UpdateAsync(cancellationToken);

                await Task.Delay(TimeSpan.FromSeconds(2), cancellationToken);
            }

            if (shouldUpdateMasters)
            {
                var mastersUpdater = scope.ServiceProvider.GetRequiredService<MastersUpdater>();

                await mastersUpdater.UpdateAsync(cancellationToken);
            }

            _logger.LogInformation("Фоновое обновление игровых данных завершено");
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Не удалось обновить игровые данные");
        }
    }

    private static async Task<bool> ShouldUpdateAsync(
        AppDbContext dbContext,
        string key,
        CancellationToken cancellationToken)
    {
        var state = await dbContext.DataSyncStates
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Key == key, cancellationToken);

        if (state?.LastSuccessAtUtc == null)
        {
            return true;
        }

        return DateTime.UtcNow - state.LastSuccessAtUtc.Value >= MinimumDataAge;
    }
}