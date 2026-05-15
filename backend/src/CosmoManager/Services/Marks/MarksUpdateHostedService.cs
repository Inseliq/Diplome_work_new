namespace CosmoManager.Services.Marks;

public class MarksUpdateHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<MarksUpdateHostedService> _logger;

    public MarksUpdateHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<MarksUpdateHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await UpdateMarksSafeAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await UpdateMarksSafeAsync(stoppingToken);
        }
    }

    private async Task UpdateMarksSafeAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _scopeFactory.CreateScope();

            var updater = scope.ServiceProvider.GetRequiredService<MarksUpdater>();

            await updater.UpdateAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Не удалось обновить отметки");
        }
    }
}