using CosmoManager.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Data;

public class AppDbContext : IdentityDbContext<AppUser, IdentityRole, string>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    public DbSet<InfoItem> InfoItems => Set<InfoItem>();

    public DbSet<Tournament> Tournaments => Set<Tournament>();

    public DbSet<TournamentMap> TournamentMaps => Set<TournamentMap>();

    public DbSet<TournamentPrize> TournamentPrizes => Set<TournamentPrize>();

    public DbSet<TournamentRegistration> TournamentRegistrations => Set<TournamentRegistration>();

    public DbSet<Vehicle> Vehicles => Set<Vehicle>();

    public DbSet<VehicleMark> VehicleMarks => Set<VehicleMark>();

    public DbSet<DataSyncState> DataSyncStates => Set<DataSyncState>();

    public DbSet<VehicleMastery> VehicleMasteries => Set<VehicleMastery>();

    public DbSet<DirectoryVehicle> DirectoryVehicles => Set<DirectoryVehicle>();

    public DbSet<DirectoryBuild> DirectoryBuilds => Set<DirectoryBuild>();

    public DbSet<DirectoryFieldModification> DirectoryFieldModifications => Set<DirectoryFieldModification>();

    public DbSet<DirectoryEquipmentItem> DirectoryEquipmentItems => Set<DirectoryEquipmentItem>();

    public DbSet<DirectoryFieldModificationItem> DirectoryFieldModificationItems => Set<DirectoryFieldModificationItem>();

    public DbSet<PopupNotification> PopupNotifications => Set<PopupNotification>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.TokenHash)
                .IsRequired();

            entity.HasIndex(x => x.TokenHash)
                .IsUnique();

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<InfoItem>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Type)
                .HasConversion<string>()
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.Title)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Category)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(x => x.Status)
                .HasMaxLength(30);

            entity.Property(x => x.DateStart)
                .HasColumnType("date")
                .IsRequired();

            entity.Property(x => x.DateEnd)
                .HasColumnType("date");

            entity.Property(x => x.ImageUrl)
                .HasMaxLength(500);

            entity.Property(x => x.Gradient)
                .HasMaxLength(500);

            entity.Property(x => x.Excerpt)
                .HasMaxLength(1000);

            entity.Property(x => x.Content);

            entity.Property(x => x.IsPublished)
                .HasDefaultValue(true);

            entity.Property(x => x.CreatedAtUtc)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.HasIndex(x => x.Type);
            entity.HasIndex(x => x.DateStart);
            entity.HasIndex(x => x.IsPublished);
        });

        builder.Entity<InfoItem>().HasData(
            new InfoItem
            {
                Id = 1,
                Type = InfoItemType.News,
                Title = "CosmoManager 1.0: история создания проекта",
                Category = "Платформа",
                Status = null,
                DateStart = new DateTime(2025, 3, 1),
                DateEnd = null,
                ImageUrl = null,
                Gradient = "linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)",
                Excerpt = "Рассказываем о том, как появился CosmoManager — от первой идеи до полноценной платформы для кланов Мир Танков.",
                Content = @"# CosmoManager 1.0 — история создания

Всё началось с идеи создать удобную платформу для управления кланом, событиями, турнирами и статистикой.

---

## Основная идея

CosmoManager объединяет новости, события, турниры, аналитику и инструменты для кланов в одном веб-приложении.

## Возможности

- управление клановой информацией;
- просмотр новостей и событий;
- работа с турнирами;
- аналитика и справочные разделы.",
                IsPublished = true,
                CreatedAtUtc = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new InfoItem
            {
                Id = 2,
                Type = InfoItemType.News,
                Title = "Обновление платформы 1.1 — что нового",
                Category = "Обновление",
                Status = null,
                DateStart = new DateTime(2025, 3, 5),
                DateEnd = null,
                ImageUrl = null,
                Gradient = "linear-gradient(135deg, #0f1e40 0%, #1a3a6b 50%, #2d5bbf 100%)",
                Excerpt = "Улучшена скорость загрузки, добавлены фильтры и исправлены найденные ошибки.",
                Content = @"## Обновление 1.1

В этом обновлении улучшена стабильность работы платформы, оптимизирована загрузка страниц и подготовлена основа для новых модулей.

---

## Основные изменения

- улучшена работа страниц новостей и событий;
- добавлена подготовка к административному управлению контентом;
- оптимизирована структура API.",
                IsPublished = true,
                CreatedAtUtc = new DateTime(2025, 3, 5, 0, 0, 0, DateTimeKind.Utc)
            },
            new InfoItem
            {
                Id = 3,
                Type = InfoItemType.News,
                Title = "Гайд по провинциям глобальной карты",
                Category = "Гайд",
                Status = null,
                DateStart = new DateTime(2025, 3, 7),
                DateEnd = null,
                ImageUrl = null,
                Gradient = "linear-gradient(135deg, #200a00 0%, #8a2200 50%, #FF5000 100%)",
                Excerpt = "Подробный разбор: какие провинции брать первыми, как удержать доходные точки и когда отступать.",
                Content = @"## Провинции глобальной карты

При выборе провинций важно учитывать активность клана, время боёв, доходность территории и состав команды.

---

## Рекомендации

- начинать с менее спорных направлений;
- удерживать провинции с высокой доходностью;
- заранее планировать составы на бои.",
                IsPublished = true,
                CreatedAtUtc = new DateTime(2025, 3, 7, 0, 0, 0, DateTimeKind.Utc)
            },

            new InfoItem
            {
                Id = 101,
                Type = InfoItemType.Event,
                Title = "Сезон Глобальной карты «Стальная воля»",
                Category = "Клан",
                Status = "active",
                DateStart = new DateTime(2025, 3, 1),
                DateEnd = new DateTime(2025, 3, 31),
                ImageUrl = null,
                Gradient = "linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)",
                Excerpt = "Кланы сражаются за провинции. Победители получат золото, декали и уникальный стиль «Стальная воля».",
                Content = @"# Сезон «Стальная воля»

Глобальная кампания, в которой кланы соревнуются за контроль над провинциями мировой карты.

---

## Условия участия

- клан должен иметь активный состав;
- необходимо зарегистрироваться до начала сезона;
- бои проходят по расписанию глобальной карты.",
                IsPublished = true,
                CreatedAtUtc = new DateTime(2025, 3, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new InfoItem
            {
                Id = 102,
                Type = InfoItemType.Event,
                Title = "Турнир «Железный кулак» #12",
                Category = "Турнир",
                Status = "active",
                DateStart = new DateTime(2025, 3, 15),
                DateEnd = new DateTime(2025, 3, 17),
                ImageUrl = null,
                Gradient = "linear-gradient(135deg, #200a00 0%, #8a2200 50%, #FF5000 100%)",
                Excerpt = "Еженедельный клановый турнир в формате 7/42. Призовой фонд 10 000 золота.",
                Content = @"# Железный кулак #12

Еженедельный турнир для кланов в формате 7/42.

---

## Формат

- групповая стадия;
- плей-офф;
- финальные бои;
- награды для лучших команд.",
                IsPublished = true,
                CreatedAtUtc = new DateTime(2025, 3, 15, 0, 0, 0, DateTimeKind.Utc)
            },
            new InfoItem
            {
                Id = 103,
                Type = InfoItemType.Event,
                Title = "Кубок Весны 2025",
                Category = "Турнир",
                Status = "soon",
                DateStart = new DateTime(2025, 4, 1),
                DateEnd = new DateTime(2025, 4, 5),
                ImageUrl = null,
                Gradient = "linear-gradient(135deg, #0a200a 0%, #145214 50%, #22c55e 100%)",
                Excerpt = "Крупный весенний турнир с призовым фондом 200 000 ₽. Регистрация открывается 25 марта.",
                Content = @"# Кубок Весны 2025

Самый крупный турнир первого полугодия. Участвуют кланы со всего СНГ.

---

## Основная информация

- формат: 15 на 15;
- количество участников ограничено;
- регистрация открывается заранее;
- победители получают денежные и внутриигровые награды.",
                IsPublished = true,
                CreatedAtUtc = new DateTime(2025, 4, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        builder.Entity<Tournament>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Description)
                .HasMaxLength(1000)
                .IsRequired();

            entity.Property(x => x.Type)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.Format)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(x => x.Classes)
                .HasMaxLength(100);

            entity.Property(x => x.Status)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.StreamUrl)
                .HasMaxLength(500);

            entity.Property(x => x.Sponsor)
                .HasMaxLength(100);

            entity.Property(x => x.DateStart)
                .HasColumnType("date");

            entity.Property(x => x.DateEnd)
                .HasColumnType("date");

            entity.Property(x => x.RegStart)
                .HasColumnType("date");

            entity.Property(x => x.RegEnd)
                .HasColumnType("date");

            entity.Property(x => x.CreatedAtUtc)
                .HasColumnType("timestamp with time zone");

            entity.HasOne(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(x => x.Status);
            entity.HasIndex(x => x.Type);
            entity.HasIndex(x => x.IsPublished);
        });

        builder.Entity<TournamentMap>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Name)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Image)
                .HasMaxLength(500)
                .IsRequired();

            entity.HasOne(x => x.Tournament)
                .WithMany(x => x.Maps)
                .HasForeignKey(x => x.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<TournamentPrize>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Place)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.Type)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.Text)
                .HasMaxLength(300);

            entity.HasOne(x => x.Tournament)
                .WithMany(x => x.Prizes)
                .HasForeignKey(x => x.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<TournamentRegistration>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.AppUserId)
                .IsRequired();

            entity.Property(x => x.TeamName)
                .HasMaxLength(100);

            entity.Property(x => x.Contact)
                .HasMaxLength(100);

            entity.Property(x => x.Comment)
                .HasMaxLength(1000);

            entity.Property(x => x.RegisteredAtUtc)
                .HasColumnType("timestamp with time zone");

            entity.HasOne(x => x.Tournament)
                .WithMany(x => x.Registrations)
                .HasForeignKey(x => x.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.TournamentId, x.AppUserId })
                .IsUnique();
        });

        builder.Entity<Tournament>().HasData(
    new Tournament
    {
        Id = 1,
        Name = "Железный кулак — Весенний сезон",
        Description = "Еженедельный клановый турнир в формате 7x7. Только для участников клана IEVGI и приглашённых команд.",
        Type = "epic",
        Tier = 10,
        Format = "7x7",
        TeamSize = 7,
        ReserveSize = 1,
        MaxParticipants = 16,
        InitialParticipants = 12,
        Classes = "BO3",
        Status = "active",
        IsStream = true,
        StreamUrl = "https://twitch.tv/evg_stream",
        DateStart = new DateTime(2025, 3, 17),
        DateEnd = new DateTime(2025, 3, 19),
        RegStart = new DateTime(2025, 3, 10),
        RegEnd = new DateTime(2025, 3, 16),
        OpenForAll = false,
        Sponsor = "EVG",
        EventId = 102,
        PrizeText = null,
        IsPublished = true,
        CreatedAtUtc = new DateTime(2025, 3, 10, 0, 0, 0, DateTimeKind.Utc)
    },
    new Tournament
    {
        Id = 2,
        Name = "Кубок Весны 2025",
        Description = "Открытый турнир для всех желающих. Формат 15x15, только X уровень. Спонсор — Lesta Games.",
        Type = "legendary",
        Tier = 10,
        Format = "15x15",
        TeamSize = 15,
        ReserveSize = 2,
        MaxParticipants = 32,
        InitialParticipants = 18,
        Classes = "BO3,PE",
        Status = "registration",
        IsStream = true,
        StreamUrl = "https://youtube.com/@cosmomanager",
        DateStart = new DateTime(2025, 4, 1),
        DateEnd = new DateTime(2025, 4, 5),
        RegStart = new DateTime(2025, 3, 20),
        RegEnd = new DateTime(2025, 3, 30),
        OpenForAll = true,
        Sponsor = "Lesta Games",
        EventId = 103,
        PrizeText = null,
        IsPublished = true,
        CreatedAtUtc = new DateTime(2025, 3, 20, 0, 0, 0, DateTimeKind.Utc)
    },
    new Tournament
    {
        Id = 3,
        Name = "Тренировочный 3x3",
        Description = "Небольшой тренировочный турнир для клана EVG. Формат 3x3, любой уровень VI–VIII.",
        Type = "common",
        Tier = 8,
        Format = "3x3",
        TeamSize = 3,
        ReserveSize = 1,
        MaxParticipants = null,
        InitialParticipants = 6,
        Classes = "ST",
        Status = "upcoming",
        IsStream = false,
        StreamUrl = null,
        DateStart = new DateTime(2025, 4, 25),
        DateEnd = new DateTime(2025, 4, 25),
        RegStart = new DateTime(2025, 4, 18),
        RegEnd = new DateTime(2025, 4, 24),
        OpenForAll = false,
        Sponsor = null,
        EventId = null,
        PrizeText = null,
        IsPublished = true,
        CreatedAtUtc = new DateTime(2025, 4, 18, 0, 0, 0, DateTimeKind.Utc)
    }
);

        builder.Entity<TournamentMap>().HasData(
    new TournamentMap { Id = 1, TournamentId = 1, Name = "Ласвилль", Image = "/images/maps/lasvile.webp" },
    new TournamentMap { Id = 2, TournamentId = 1, Name = "Степи", Image = "/images/maps/steppes.webp" },
    new TournamentMap { Id = 3, TournamentId = 1, Name = "Прохоровка", Image = "/images/maps/prokhorovka.webp" },

    new TournamentMap { Id = 4, TournamentId = 2, Name = "Прохоровка", Image = "/images/maps/prokhorovka.webp" },
    new TournamentMap { Id = 5, TournamentId = 2, Name = "Химмельсдорф", Image = "/images/maps/himmelsdorf.webp" },

    new TournamentMap { Id = 6, TournamentId = 3, Name = "Степи", Image = "/images/maps/steppes.webp" }
);

        builder.Entity<TournamentPrize>().HasData(
    new TournamentPrize { Id = 1, TournamentId = 1, Place = "place1", Amount = 5000, Type = "gold", Text = null },
    new TournamentPrize { Id = 2, TournamentId = 1, Place = "place2", Amount = 3000, Type = "gold", Text = null },
    new TournamentPrize { Id = 3, TournamentId = 1, Place = "place3", Amount = 1500, Type = "gold", Text = null },
    new TournamentPrize { Id = 4, TournamentId = 1, Place = "others", Amount = 500, Type = "gold", Text = null },

    new TournamentPrize { Id = 5, TournamentId = 2, Place = "place1", Amount = 200000, Type = "rub", Text = null },
    new TournamentPrize { Id = 6, TournamentId = 2, Place = "place2", Amount = 100000, Type = "rub", Text = null },
    new TournamentPrize { Id = 7, TournamentId = 2, Place = "place3", Amount = 50000, Type = "rub", Text = null },
    new TournamentPrize { Id = 8, TournamentId = 2, Place = "others", Amount = 10000, Type = "rub", Text = null },

    new TournamentPrize { Id = 9, TournamentId = 3, Place = "place1", Amount = 1000, Type = "gold", Text = null },
    new TournamentPrize { Id = 10, TournamentId = 3, Place = "place2", Amount = 500, Type = "gold", Text = null }
);

        builder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.InternalName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Nation)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.Type)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.Name)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.ShortName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Role)
                .HasMaxLength(100);

            entity.Property(x => x.UpdatedAtUtc)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.HasIndex(x => x.Nation);
            entity.HasIndex(x => x.Type);
            entity.HasIndex(x => x.Tier);
        });

        builder.Entity<VehicleMark>(entity =>
        {
            entity.HasKey(x => x.VehicleId);

            entity.Property(x => x.UpdatedAtUtc)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.HasOne(x => x.Vehicle)
                .WithOne(x => x.Mark)
                .HasForeignKey<VehicleMark>(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DataSyncState>(entity =>
        {
            entity.HasKey(x => x.Key);

            entity.Property(x => x.Key)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.LastSuccessAtUtc)
                .HasColumnType("timestamp with time zone");

            entity.Property(x => x.LastErrorAtUtc)
                .HasColumnType("timestamp with time zone");

            entity.Property(x => x.LastError)
                .HasMaxLength(2000);
        });

        builder.Entity<VehicleMastery>(entity =>
        {
            entity.HasKey(x => x.VehicleId);

            entity.Property(x => x.UpdatedAtUtc)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.HasOne(x => x.Vehicle)
                .WithOne(x => x.Mastery)
                .HasForeignKey<VehicleMastery>(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DirectoryVehicle>(entity =>
        {
            entity.HasKey(x => x.VehicleId);

            entity.Property(x => x.ImageUrl)
                .HasMaxLength(500);

            entity.Property(x => x.IsPublished)
                .HasDefaultValue(true);

            entity.Property(x => x.UpdatedAtUtc)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.HasOne(x => x.Vehicle)
                .WithOne()
                .HasForeignKey<DirectoryVehicle>(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<DirectoryBuild>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.ModeKey)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.StateKey)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.Equipment1Key)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Equipment2Key)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Equipment3Key)
                .HasMaxLength(100)
                .IsRequired();

            entity.HasOne(x => x.DirectoryVehicle)
                .WithMany(x => x.Builds)
                .HasForeignKey(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.VehicleId, x.ModeKey, x.StateKey })
                .IsUnique();
        });

        builder.Entity<DirectoryFieldModification>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.SectionKey)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.LeftItemKey)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.RightItemKey)
                .HasMaxLength(100)
                .IsRequired();

            entity.HasOne(x => x.DirectoryVehicle)
                .WithMany(x => x.FieldModifications)
                .HasForeignKey(x => x.VehicleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(x => new { x.VehicleId, x.SectionKey })
                .IsUnique();
        });

        builder.Entity<DirectoryEquipmentItem>(entity =>
        {
            entity.HasKey(x => x.Key);

            entity.Property(x => x.Key)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Label)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Tier)
                .HasMaxLength(30)
                .IsRequired();

            entity.Property(x => x.ImageUrl)
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(x => x.IsActive)
                .HasDefaultValue(true);
        });

        builder.Entity<DirectoryFieldModificationItem>(entity =>
        {
            entity.HasKey(x => x.Key);

            entity.Property(x => x.Key)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(x => x.Label)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(x => x.ImageUrl)
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(x => x.IsActive)
                .HasDefaultValue(true);
        });

        builder.Entity<PopupNotification>(entity =>
        {
            entity.HasKey(x => x.Id);

            entity.Property(x => x.Message)
                .HasMaxLength(200)
                .IsRequired();

            entity.Property(x => x.Description)
                .IsRequired();

            entity.Property(x => x.SourceButton)
                .HasMaxLength(500);

            entity.Property(x => x.IsPublished)
                .HasDefaultValue(true);

            entity.Property(x => x.CreatedAtUtc)
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.Property(x => x.StartsAtUtc)
                .HasColumnType("timestamp with time zone");

            entity.Property(x => x.EndsAtUtc)
                .HasColumnType("timestamp with time zone");

            entity.HasIndex(x => x.IsPublished);
            entity.HasIndex(x => x.StartsAtUtc);
            entity.HasIndex(x => x.EndsAtUtc);
            entity.HasIndex(x => x.SortOrder);
        });

        builder.Entity<PopupNotification>().HasData(
    new PopupNotification
    {
        Id = 1,
        Message = "Кубок Весны 2025 — регистрация открыта!",
        Description = @"## Кубок Весны 2025
Регистрация на турнир **открыта** до **30 марта**.

### Тест ссылки
[Тестовая ссылка](/services)

### Тест изображения
![Test_image](/images/ievgi_195x195.png)

Подробнее — на странице турнира.",
        SourceButton = "Подробнее:/tournaments/custom/details/2",
        IsPublished = true,
        CreatedAtUtc = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc),
        StartsAtUtc = null,
        EndsAtUtc = null,
        SortOrder = 100
    }
);

        // ─────────────────────────────────────────────
        // Demo seed: тестовая сборка каталога для ИС-7
        // ─────────────────────────────────────────────

        var seedDate = new DateTime(2026, 5, 15, 0, 0, 0, DateTimeKind.Utc);

        const int is7VehicleId = 7169;

        // Техника ИС-7.
        // Нужна, чтобы DirectoryVehicle мог сослаться на существующий Vehicle.
        // Если Vehicles уже заполняются из Poliroid, updater потом просто обновит эту запись.
        builder.Entity<Vehicle>().HasData(new Vehicle
        {
            Id = is7VehicleId,
            InternalName = "r45_is-7",
            Nation = "ussr",
            Type = "heavyTank",
            Tier = 10,
            Name = "ИС-7",
            ShortName = "ИС-7",
            IsTechTree = true,
            IsPremium = false,
            IsSpecial = false,
            IsCollector = false,
            Role = "role_HT_break",
            UpdatedAtUtc = seedDate
        });

        // Запись страницы каталога для ИС-7.
        // Именно эта картинка будет использоваться в TankDirectory.
        builder.Entity<DirectoryVehicle>().HasData(new DirectoryVehicle
        {
            VehicleId = is7VehicleId,
            ImageUrl = "/images/tanks/r45_is-7.webp",
            IsPublished = true,
            UpdatedAtUtc = seedDate
        });

        // Тестовый справочник оборудования.
        builder.Entity<DirectoryEquipmentItem>().HasData(
            new DirectoryEquipmentItem
            {
                Key = "hardening",
                Label = "Улучшенная закалка",
                Tier = "std",
                ImageUrl = "/images/equipment/hardening.png",
                IsActive = true,
                SortOrder = 1
            },
            new DirectoryEquipmentItem
            {
                Key = "rammer",
                Label = "Орудийный досылатель",
                Tier = "std",
                ImageUrl = "/images/equipment/rammer.png",
                IsActive = true,
                SortOrder = 2
            },
            new DirectoryEquipmentItem
            {
                Key = "stabilizer",
                Label = "Стабилизатор вертикальной наводки",
                Tier = "std",
                ImageUrl = "/images/equipment/stabilizer.png",
                IsActive = true,
                SortOrder = 3
            },
            new DirectoryEquipmentItem
            {
                Key = "turbo",
                Label = "Турбонагнетатель",
                Tier = "std",
                ImageUrl = "/images/equipment/turbo.png",
                IsActive = true,
                SortOrder = 4
            },
            new DirectoryEquipmentItem
            {
                Key = "vents",
                Label = "Улучшенная вентиляция",
                Tier = "std",
                ImageUrl = "/images/equipment/vents.png",
                IsActive = true,
                SortOrder = 5
            }
        );

        // Тестовый справочник полевой модернизации.
        builder.Entity<DirectoryFieldModificationItem>().HasData(
            new DirectoryFieldModificationItem
            {
                Key = "item__1",
                Label = "Вездеходная ходовая",
                ImageUrl = "/images/polevaya/item__1.png",
                IsActive = true,
                SortOrder = 1
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__2",
                Label = "Облегчённая ходовая",
                ImageUrl = "/images/polevaya/item__2.png",
                IsActive = true,
                SortOrder = 2
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__3",
                Label = "Настройка подвески",
                ImageUrl = "/images/polevaya/item__3.png",
                IsActive = true,
                SortOrder = 3
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__4",
                Label = "Настройка прицела",
                ImageUrl = "/images/polevaya/item__4.png",
                IsActive = true,
                SortOrder = 4
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__5",
                Label = "Настройка двигателя",
                ImageUrl = "/images/polevaya/item__5.png",
                IsActive = true,
                SortOrder = 5
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__6",
                Label = "Настройка боекомплекта",
                ImageUrl = "/images/polevaya/item__6.png",
                IsActive = true,
                SortOrder = 6
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__7",
                Label = "Настройка живучести",
                ImageUrl = "/images/polevaya/item__7.png",
                IsActive = true,
                SortOrder = 7
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__8",
                Label = "Настройка огневой мощи",
                ImageUrl = "/images/polevaya/item__8.png",
                IsActive = true,
                SortOrder = 8
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__9",
                Label = "Настройка мобильности",
                ImageUrl = "/images/polevaya/item__9.png",
                IsActive = true,
                SortOrder = 9
            },
            new DirectoryFieldModificationItem
            {
                Key = "item__10",
                Label = "Настройка обзора",
                ImageUrl = "/images/polevaya/item__10.png",
                IsActive = true,
                SortOrder = 10
            }
        );

        // Тестовые сборки оборудования для ИС-7.
        builder.Entity<DirectoryBuild>().HasData(
            new DirectoryBuild
            {
                Id = 716901,
                VehicleId = is7VehicleId,
                ModeKey = "random",
                StateKey = "default",
                Equipment1Key = "hardening",
                Equipment2Key = "rammer",
                Equipment3Key = "stabilizer",
                SortOrder = 1
            },
            new DirectoryBuild
            {
                Id = 716902,
                VehicleId = is7VehicleId,
                ModeKey = "random",
                StateKey = "state1",
                Equipment1Key = "hardening",
                Equipment2Key = "rammer",
                Equipment3Key = "turbo",
                SortOrder = 2
            },
            new DirectoryBuild
            {
                Id = 716903,
                VehicleId = is7VehicleId,
                ModeKey = "fortified",
                StateKey = "default",
                Equipment1Key = "hardening",
                Equipment2Key = "rammer",
                Equipment3Key = "vents",
                SortOrder = 3
            }
        );

        // Тестовая полевая модернизация для ИС-7.
        builder.Entity<DirectoryFieldModification>().HasData(
            new DirectoryFieldModification
            {
                Id = 716911,
                VehicleId = is7VehicleId,
                SectionKey = "section1",
                LeftItemKey = "item__1",
                LeftSelected = false,
                RightItemKey = "item__2",
                RightSelected = true,
                SortOrder = 1
            },
            new DirectoryFieldModification
            {
                Id = 716912,
                VehicleId = is7VehicleId,
                SectionKey = "section2",
                LeftItemKey = "item__3",
                LeftSelected = true,
                RightItemKey = "item__4",
                RightSelected = false,
                SortOrder = 2
            },
            new DirectoryFieldModification
            {
                Id = 716913,
                VehicleId = is7VehicleId,
                SectionKey = "section3",
                LeftItemKey = "item__5",
                LeftSelected = false,
                RightItemKey = "item__6",
                RightSelected = true,
                SortOrder = 3
            },
            new DirectoryFieldModification
            {
                Id = 716914,
                VehicleId = is7VehicleId,
                SectionKey = "section4",
                LeftItemKey = "item__7",
                LeftSelected = true,
                RightItemKey = "item__8",
                RightSelected = false,
                SortOrder = 4
            },
            new DirectoryFieldModification
            {
                Id = 716915,
                VehicleId = is7VehicleId,
                SectionKey = "section5",
                LeftItemKey = "item__9",
                LeftSelected = false,
                RightItemKey = "item__10",
                RightSelected = true,
                SortOrder = 5
            }
        );
    }
}