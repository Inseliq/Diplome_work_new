namespace CosmoManager.Services.Masters;

public class MastersUpdateHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MastersUpdateHostedService> _logger;

    public MastersUpdateHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<MastersUpdateHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await UpdateMastersSafeAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await UpdateMastersSafeAsync(stoppingToken);
        }
    }

    private async Task UpdateMastersSafeAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();

            var updater = scope.ServiceProvider.GetRequiredService<MastersUpdater>();

            await updater.UpdateAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Не удалось обновить данные знаков классности");
        }
    }
}