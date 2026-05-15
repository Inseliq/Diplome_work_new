using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace CosmoManager.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Nickname = table.Column<string>(type: "text", nullable: false),
                    UserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    SecurityStamp = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "text", nullable: true),
                    PhoneNumber = table.Column<string>(type: "text", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DataSyncStates",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastSuccessAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastErrorAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastError = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DataSyncStates", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "InfoItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    DateStart = table.Column<DateTime>(type: "date", nullable: false),
                    DateEnd = table.Column<DateTime>(type: "date", nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Gradient = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Excerpt = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Content = table.Column<string>(type: "text", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InfoItems", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Vehicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    InternalName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Nation = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Tier = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    ShortName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsTechTree = table.Column<bool>(type: "boolean", nullable: false),
                    IsPremium = table.Column<bool>(type: "boolean", nullable: false),
                    IsSpecial = table.Column<bool>(type: "boolean", nullable: false),
                    IsCollector = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vehicles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    RoleId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    ClaimType = table.Column<string>(type: "text", nullable: true),
                    ClaimValue = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    ProviderKey = table.Column<string>(type: "text", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "text", nullable: false),
                    LoginProvider = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TokenHash = table.Column<string>(type: "text", nullable: false),
                    AppUserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReplacedByTokenHash = table.Column<string>(type: "text", nullable: true),
                    CreatedByIp = table.Column<string>(type: "text", nullable: true),
                    RevokedByIp = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Tournaments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Tier = table.Column<int>(type: "integer", nullable: false),
                    Format = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TeamSize = table.Column<int>(type: "integer", nullable: false),
                    ReserveSize = table.Column<int>(type: "integer", nullable: false),
                    MaxParticipants = table.Column<int>(type: "integer", nullable: true),
                    InitialParticipants = table.Column<int>(type: "integer", nullable: false),
                    Classes = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    IsStream = table.Column<bool>(type: "boolean", nullable: false),
                    StreamUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    DateStart = table.Column<DateTime>(type: "date", nullable: false),
                    DateEnd = table.Column<DateTime>(type: "date", nullable: false),
                    RegStart = table.Column<DateTime>(type: "date", nullable: false),
                    RegEnd = table.Column<DateTime>(type: "date", nullable: false),
                    OpenForAll = table.Column<bool>(type: "boolean", nullable: false),
                    Sponsor = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    PrizeText = table.Column<string>(type: "text", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EventId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tournaments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tournaments_InfoItems_EventId",
                        column: x => x.EventId,
                        principalTable: "InfoItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "VehicleMarks",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    Moe65 = table.Column<int>(type: "integer", nullable: true),
                    Moe85 = table.Column<int>(type: "integer", nullable: true),
                    Moe95 = table.Column<int>(type: "integer", nullable: true),
                    Moe100 = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleMarks", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_VehicleMarks_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VehicleMasteries",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    Deg3 = table.Column<int>(type: "integer", nullable: true),
                    Deg2 = table.Column<int>(type: "integer", nullable: true),
                    Deg1 = table.Column<int>(type: "integer", nullable: true),
                    Master = table.Column<int>(type: "integer", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleMasteries", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_VehicleMasteries_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TournamentMaps",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TournamentId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Image = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentMaps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TournamentMaps_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TournamentPrizes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TournamentId = table.Column<int>(type: "integer", nullable: false),
                    Place = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Text = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentPrizes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TournamentPrizes_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TournamentRegistrations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TournamentId = table.Column<int>(type: "integer", nullable: false),
                    AppUserId = table.Column<string>(type: "text", nullable: false),
                    TeamName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Contact = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    RegisteredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentRegistrations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TournamentRegistrations_AspNetUsers_AppUserId",
                        column: x => x.AppUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TournamentRegistrations_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "InfoItems",
                columns: new[] { "Id", "Category", "Content", "CreatedAtUtc", "DateEnd", "DateStart", "Excerpt", "Gradient", "ImageUrl", "IsPublished", "Status", "Title", "Type" },
                values: new object[,]
                {
                    { 1, "Платформа", "# CosmoManager 1.0 — история создания\r\n\r\nВсё началось с идеи создать удобную платформу для управления кланом, событиями, турнирами и статистикой.\r\n\r\n---\r\n\r\n## Основная идея\r\n\r\nCosmoManager объединяет новости, события, турниры, аналитику и инструменты для кланов в одном веб-приложении.\r\n\r\n## Возможности\r\n\r\n- управление клановой информацией;\r\n- просмотр новостей и событий;\r\n- работа с турнирами;\r\n- аналитика и справочные разделы.", new DateTime(2025, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2025, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Рассказываем о том, как появился CosmoManager — от первой идеи до полноценной платформы для кланов Мир Танков.", "linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)", null, true, null, "CosmoManager 1.0: история создания проекта", "News" },
                    { 2, "Обновление", "## Обновление 1.1\r\n\r\nВ этом обновлении улучшена стабильность работы платформы, оптимизирована загрузка страниц и подготовлена основа для новых модулей.\r\n\r\n---\r\n\r\n## Основные изменения\r\n\r\n- улучшена работа страниц новостей и событий;\r\n- добавлена подготовка к административному управлению контентом;\r\n- оптимизирована структура API.", new DateTime(2025, 3, 5, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2025, 3, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), "Улучшена скорость загрузки, добавлены фильтры и исправлены найденные ошибки.", "linear-gradient(135deg, #0f1e40 0%, #1a3a6b 50%, #2d5bbf 100%)", null, true, null, "Обновление платформы 1.1 — что нового", "News" },
                    { 3, "Гайд", "## Провинции глобальной карты\r\n\r\nПри выборе провинций важно учитывать активность клана, время боёв, доходность территории и состав команды.\r\n\r\n---\r\n\r\n## Рекомендации\r\n\r\n- начинать с менее спорных направлений;\r\n- удерживать провинции с высокой доходностью;\r\n- заранее планировать составы на бои.", new DateTime(2025, 3, 7, 0, 0, 0, 0, DateTimeKind.Utc), null, new DateTime(2025, 3, 7, 0, 0, 0, 0, DateTimeKind.Unspecified), "Подробный разбор: какие провинции брать первыми, как удержать доходные точки и когда отступать.", "linear-gradient(135deg, #200a00 0%, #8a2200 50%, #FF5000 100%)", null, true, null, "Гайд по провинциям глобальной карты", "News" },
                    { 101, "Клан", "# Сезон «Стальная воля»\r\n\r\nГлобальная кампания, в которой кланы соревнуются за контроль над провинциями мировой карты.\r\n\r\n---\r\n\r\n## Условия участия\r\n\r\n- клан должен иметь активный состав;\r\n- необходимо зарегистрироваться до начала сезона;\r\n- бои проходят по расписанию глобальной карты.", new DateTime(2025, 3, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 3, 31, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 3, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Кланы сражаются за провинции. Победители получат золото, декали и уникальный стиль «Стальная воля».", "linear-gradient(135deg, #1a0540 0%, #582BBA 60%, #835de4 100%)", null, true, "active", "Сезон Глобальной карты «Стальная воля»", "Event" },
                    { 102, "Турнир", "# Железный кулак #12\r\n\r\nЕженедельный турнир для кланов в формате 7/42.\r\n\r\n---\r\n\r\n## Формат\r\n\r\n- групповая стадия;\r\n- плей-офф;\r\n- финальные бои;\r\n- награды для лучших команд.", new DateTime(2025, 3, 15, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 3, 15, 0, 0, 0, 0, DateTimeKind.Unspecified), "Еженедельный клановый турнир в формате 7/42. Призовой фонд 10 000 золота.", "linear-gradient(135deg, #200a00 0%, #8a2200 50%, #FF5000 100%)", null, true, "active", "Турнир «Железный кулак» #12", "Event" },
                    { 103, "Турнир", "# Кубок Весны 2025\r\n\r\nСамый крупный турнир первого полугодия. Участвуют кланы со всего СНГ.\r\n\r\n---\r\n\r\n## Основная информация\r\n\r\n- формат: 15 на 15;\r\n- количество участников ограничено;\r\n- регистрация открывается заранее;\r\n- победители получают денежные и внутриигровые награды.", new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 4, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Крупный весенний турнир с призовым фондом 200 000 ₽. Регистрация открывается 25 марта.", "linear-gradient(135deg, #0a200a 0%, #145214 50%, #22c55e 100%)", null, true, "soon", "Кубок Весны 2025", "Event" }
                });

            migrationBuilder.InsertData(
                table: "Tournaments",
                columns: new[] { "Id", "Classes", "CreatedAtUtc", "DateEnd", "DateStart", "Description", "EventId", "Format", "InitialParticipants", "IsPublished", "IsStream", "MaxParticipants", "Name", "OpenForAll", "PrizeText", "RegEnd", "RegStart", "ReserveSize", "Sponsor", "Status", "StreamUrl", "TeamSize", "Tier", "Type" },
                values: new object[] { 3, "ST", new DateTime(2025, 4, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 4, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Небольшой тренировочный турнир для клана EVG. Формат 3x3, любой уровень VI–VIII.", null, "3x3", 6, true, false, null, "Тренировочный 3x3", false, null, new DateTime(2025, 4, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, null, "upcoming", null, 3, 8, "common" });

            migrationBuilder.InsertData(
                table: "TournamentMaps",
                columns: new[] { "Id", "Image", "Name", "TournamentId" },
                values: new object[] { 6, "/images/maps/steppes.webp", "Степи", 3 });

            migrationBuilder.InsertData(
                table: "TournamentPrizes",
                columns: new[] { "Id", "Amount", "Place", "Text", "TournamentId", "Type" },
                values: new object[,]
                {
                    { 9, 1000, "place1", null, 3, "gold" },
                    { 10, 500, "place2", null, 3, "gold" }
                });

            migrationBuilder.InsertData(
                table: "Tournaments",
                columns: new[] { "Id", "Classes", "CreatedAtUtc", "DateEnd", "DateStart", "Description", "EventId", "Format", "InitialParticipants", "IsPublished", "IsStream", "MaxParticipants", "Name", "OpenForAll", "PrizeText", "RegEnd", "RegStart", "ReserveSize", "Sponsor", "Status", "StreamUrl", "TeamSize", "Tier", "Type" },
                values: new object[,]
                {
                    { 1, "BO3", new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 3, 19, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 3, 17, 0, 0, 0, 0, DateTimeKind.Unspecified), "Еженедельный клановый турнир в формате 7x7. Только для участников клана IEVGI и приглашённых команд.", 102, "7x7", 12, true, true, 16, "Железный кулак — Весенний сезон", false, null, new DateTime(2025, 3, 16, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 3, 10, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, "EVG", "active", "https://twitch.tv/evg_stream", 7, 10, "epic" },
                    { 2, "BO3,PE", new DateTime(2025, 3, 20, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 4, 5, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "Открытый турнир для всех желающих. Формат 15x15, только X уровень. Спонсор — Lesta Games.", 103, "15x15", 18, true, true, 32, "Кубок Весны 2025", true, null, new DateTime(2025, 3, 30, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 3, 20, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, "Lesta Games", "registration", "https://youtube.com/@cosmomanager", 15, 10, "legendary" }
                });

            migrationBuilder.InsertData(
                table: "TournamentMaps",
                columns: new[] { "Id", "Image", "Name", "TournamentId" },
                values: new object[,]
                {
                    { 1, "/images/maps/lasvile.webp", "Ласвилль", 1 },
                    { 2, "/images/maps/steppes.webp", "Степи", 1 },
                    { 3, "/images/maps/prokhorovka.webp", "Прохоровка", 1 },
                    { 4, "/images/maps/prokhorovka.webp", "Прохоровка", 2 },
                    { 5, "/images/maps/himmelsdorf.webp", "Химмельсдорф", 2 }
                });

            migrationBuilder.InsertData(
                table: "TournamentPrizes",
                columns: new[] { "Id", "Amount", "Place", "Text", "TournamentId", "Type" },
                values: new object[,]
                {
                    { 1, 5000, "place1", null, 1, "gold" },
                    { 2, 3000, "place2", null, 1, "gold" },
                    { 3, 1500, "place3", null, 1, "gold" },
                    { 4, 500, "others", null, 1, "gold" },
                    { 5, 200000, "place1", null, 2, "rub" },
                    { 6, 100000, "place2", null, 2, "rub" },
                    { 7, 50000, "place3", null, 2, "rub" },
                    { 8, 10000, "others", null, 2, "rub" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InfoItems_DateStart",
                table: "InfoItems",
                column: "DateStart");

            migrationBuilder.CreateIndex(
                name: "IX_InfoItems_IsPublished",
                table: "InfoItems",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_InfoItems_Type",
                table: "InfoItems",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_AppUserId",
                table: "RefreshTokens",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_TokenHash",
                table: "RefreshTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMaps_TournamentId",
                table: "TournamentMaps",
                column: "TournamentId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentPrizes_TournamentId",
                table: "TournamentPrizes",
                column: "TournamentId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistrations_AppUserId",
                table: "TournamentRegistrations",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistrations_TournamentId_AppUserId",
                table: "TournamentRegistrations",
                columns: new[] { "TournamentId", "AppUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_EventId",
                table: "Tournaments",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_IsPublished",
                table: "Tournaments",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_Status",
                table: "Tournaments",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Tournaments_Type",
                table: "Tournaments",
                column: "Type");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_Nation",
                table: "Vehicles",
                column: "Nation");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_Tier",
                table: "Vehicles",
                column: "Tier");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicles_Type",
                table: "Vehicles",
                column: "Type");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "DataSyncStates");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "TournamentMaps");

            migrationBuilder.DropTable(
                name: "TournamentPrizes");

            migrationBuilder.DropTable(
                name: "TournamentRegistrations");

            migrationBuilder.DropTable(
                name: "VehicleMarks");

            migrationBuilder.DropTable(
                name: "VehicleMasteries");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Tournaments");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "InfoItems");
        }
    }
}
