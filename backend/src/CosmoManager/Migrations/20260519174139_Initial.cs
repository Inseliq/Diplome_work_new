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
                name: "Clans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tag = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    EloRating = table.Column<int>(type: "integer", nullable: false, defaultValue: 1000),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clans", x => x.Id);
                    table.CheckConstraint("CK_Clans_EloRating_Min", "\"EloRating\" >= 0");
                    table.CheckConstraint("CK_Clans_Tag_Format", "\"Tag\" ~ '^[A-Za-z0-9_-]{3,5}$'");
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
                name: "DirectoryEquipmentItems",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Tier = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectoryEquipmentItems", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "DirectoryFieldModificationItems",
                columns: table => new
                {
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Label = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectoryFieldModificationItems", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "HomeBanners",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Slot = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    ButtonLabel = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    ButtonUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Gradient = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HomeBanners", x => x.Id);
                    table.CheckConstraint("CK_HomeBanners_Slot", "\"Slot\" IN (1, 2)");
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
                name: "PopupNotifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Message = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    SourceButton = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PopupNotifications", x => x.Id);
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
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    Nickname = table.Column<string>(type: "character varying(24)", maxLength: 24, nullable: false),
                    ClanId = table.Column<int>(type: "integer", nullable: true),
                    ClanRank = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
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
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "ClanReserveInventories",
                columns: table => new
                {
                    ClanId = table.Column<int>(type: "integer", nullable: false),
                    ReserveType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Amount = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanReserveInventories", x => new { x.ClanId, x.ReserveType });
                    table.CheckConstraint("CK_ClanReserveInventories_Amount_Min", "\"Amount\" >= 0");
                    table.ForeignKey(
                        name: "FK_ClanReserveInventories_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
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
                name: "DirectoryVehicles",
                columns: table => new
                {
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectoryVehicles", x => x.VehicleId);
                    table.ForeignKey(
                        name: "FK_DirectoryVehicles_Vehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "Vehicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
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
                name: "ClanReserveActivations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ClanId = table.Column<int>(type: "integer", nullable: false),
                    ReserveType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReserveGroup = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ActivatedByUserId = table.Column<string>(type: "text", nullable: false),
                    ActivatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClanReserveActivations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClanReserveActivations_AspNetUsers_ActivatedByUserId",
                        column: x => x.ActivatedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ClanReserveActivations_Clans_ClanId",
                        column: x => x.ClanId,
                        principalTable: "Clans",
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
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RegisteredAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewedByUserId = table.Column<string>(type: "text", nullable: true),
                    ReviewComment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
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
                        name: "FK_TournamentRegistrations_AspNetUsers_ReviewedByUserId",
                        column: x => x.ReviewedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TournamentRegistrations_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DirectoryBuilds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    ModeKey = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    StateKey = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Equipment1Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Equipment2Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Equipment3Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectoryBuilds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectoryBuilds_DirectoryVehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "DirectoryVehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DirectoryFieldModifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VehicleId = table.Column<int>(type: "integer", nullable: false),
                    SectionKey = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    LeftItemKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LeftSelected = table.Column<bool>(type: "boolean", nullable: false),
                    RightItemKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RightSelected = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DirectoryFieldModifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DirectoryFieldModifications_DirectoryVehicles_VehicleId",
                        column: x => x.VehicleId,
                        principalTable: "DirectoryVehicles",
                        principalColumn: "VehicleId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TournamentMatches",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TournamentId = table.Column<int>(type: "integer", nullable: false),
                    Bracket = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    RoundSize = table.Column<int>(type: "integer", nullable: false),
                    RoundNumber = table.Column<int>(type: "integer", nullable: false),
                    MatchNumber = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    ResultStatus = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Team1Score = table.Column<int>(type: "integer", nullable: false),
                    Team2Score = table.Column<int>(type: "integer", nullable: false),
                    WinnerRegistrationId = table.Column<int>(type: "integer", nullable: true),
                    AdvancingRegistrationId = table.Column<int>(type: "integer", nullable: true),
                    WinnerToMatchId = table.Column<int>(type: "integer", nullable: true),
                    WinnerToSlotNumber = table.Column<int>(type: "integer", nullable: true),
                    LoserToMatchId = table.Column<int>(type: "integer", nullable: true),
                    LoserToSlotNumber = table.Column<int>(type: "integer", nullable: true),
                    ScheduledAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StartedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    FinishedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    StreamUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentMatches", x => x.Id);
                    table.CheckConstraint("CK_TournamentMatches_LoserToSlot", "\"LoserToSlotNumber\" IS NULL OR \"LoserToSlotNumber\" IN (1, 2)");
                    table.CheckConstraint("CK_TournamentMatches_MatchNumber_Min", "\"MatchNumber\" >= 1");
                    table.CheckConstraint("CK_TournamentMatches_RoundNumber_Min", "\"RoundNumber\" >= 1");
                    table.CheckConstraint("CK_TournamentMatches_RoundSize_Min", "\"RoundSize\" >= 2");
                    table.CheckConstraint("CK_TournamentMatches_Team1Score_Min", "\"Team1Score\" >= 0");
                    table.CheckConstraint("CK_TournamentMatches_Team2Score_Min", "\"Team2Score\" >= 0");
                    table.CheckConstraint("CK_TournamentMatches_WinnerToSlot", "\"WinnerToSlotNumber\" IS NULL OR \"WinnerToSlotNumber\" IN (1, 2)");
                    table.ForeignKey(
                        name: "FK_TournamentMatches_TournamentMatches_LoserToMatchId",
                        column: x => x.LoserToMatchId,
                        principalTable: "TournamentMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TournamentMatches_TournamentMatches_WinnerToMatchId",
                        column: x => x.WinnerToMatchId,
                        principalTable: "TournamentMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TournamentMatches_TournamentRegistrations_AdvancingRegistra~",
                        column: x => x.AdvancingRegistrationId,
                        principalTable: "TournamentRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TournamentMatches_TournamentRegistrations_WinnerRegistratio~",
                        column: x => x.WinnerRegistrationId,
                        principalTable: "TournamentRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TournamentMatches_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TournamentRegistrationPlayers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TournamentId = table.Column<int>(type: "integer", nullable: false),
                    RegistrationId = table.Column<int>(type: "integer", nullable: false),
                    Nickname = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    NormalizedNickname = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    BlocksNickname = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentRegistrationPlayers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TournamentRegistrationPlayers_TournamentRegistrations_Regis~",
                        column: x => x.RegistrationId,
                        principalTable: "TournamentRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TournamentRegistrationPlayers_Tournaments_TournamentId",
                        column: x => x.TournamentId,
                        principalTable: "Tournaments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TournamentMatchSlots",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MatchId = table.Column<int>(type: "integer", nullable: false),
                    SlotNumber = table.Column<int>(type: "integer", nullable: false),
                    RegistrationId = table.Column<int>(type: "integer", nullable: true),
                    SourceMatchId = table.Column<int>(type: "integer", nullable: true),
                    SourceResult = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    SeedNumber = table.Column<int>(type: "integer", nullable: true),
                    IsBye = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TournamentMatchSlots", x => x.Id);
                    table.CheckConstraint("CK_TournamentMatchSlots_SlotNumber", "\"SlotNumber\" IN (1, 2)");
                    table.CheckConstraint("CK_TournamentMatchSlots_SourceResult", "\"SourceResult\" IS NULL OR \"SourceResult\" IN ('winner', 'loser')");
                    table.ForeignKey(
                        name: "FK_TournamentMatchSlots_TournamentMatches_MatchId",
                        column: x => x.MatchId,
                        principalTable: "TournamentMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TournamentMatchSlots_TournamentMatches_SourceMatchId",
                        column: x => x.SourceMatchId,
                        principalTable: "TournamentMatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TournamentMatchSlots_TournamentRegistrations_RegistrationId",
                        column: x => x.RegistrationId,
                        principalTable: "TournamentRegistrations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "DirectoryEquipmentItems",
                columns: new[] { "Key", "ImageUrl", "IsActive", "Label", "SortOrder", "Tier" },
                values: new object[,]
                {
                    { "hardening__t3", "/images/equipment/hardening_t3.png", true, "Комплекс улучшения выживаемости", 1, "t3" },
                    { "rammer__t3", "/images/equipment/rammer_t3.png", true, "Многозубая каретка досылателя", 2, "t3" },
                    { "stabilizer__bonns", "/images/equipment/stabilizer_bonns.png", true, "Боновый стабилизатор", 3, "bonns" },
                    { "turbine__t3", "/images/equipment/turbine_t3.png", true, "Система повышения мобильности", 4, "t3" },
                    { "vents", "/images/equipment/vents.png", true, "Улучшенная вентиляция", 5, "std" }
                });

            migrationBuilder.InsertData(
                table: "DirectoryFieldModificationItems",
                columns: new[] { "Key", "ImageUrl", "IsActive", "Label", "SortOrder" },
                values: new object[,]
                {
                    { "item__1", "/images/polevaya/item__1.png", true, "Вездеходная ходовая", 1 },
                    { "item__10", "/images/polevaya/item__10.png", true, "Настройка обзора", 10 },
                    { "item__2", "/images/polevaya/item__2.png", true, "Облегчённая ходовая", 2 },
                    { "item__3", "/images/polevaya/item__3.png", true, "Настройка подвески", 3 },
                    { "item__4", "/images/polevaya/item__4.png", true, "Настройка прицела", 4 },
                    { "item__5", "/images/polevaya/item__5.png", true, "Настройка двигателя", 5 },
                    { "item__6", "/images/polevaya/item__6.png", true, "Настройка боекомплекта", 6 },
                    { "item__7", "/images/polevaya/item__7.png", true, "Настройка живучести", 7 },
                    { "item__8", "/images/polevaya/item__8.png", true, "Настройка огневой мощи", 8 },
                    { "item__9", "/images/polevaya/item__9.png", true, "Настройка мобильности", 9 }
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
                table: "PopupNotifications",
                columns: new[] { "Id", "CreatedAtUtc", "Description", "EndsAtUtc", "IsPublished", "Message", "SortOrder", "SourceButton", "StartsAtUtc" },
                values: new object[] { 1, new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc), "## Кубок Весны 2025\r\nРегистрация на турнир **открыта** до **30 марта**.\r\n\r\n### Тест ссылки\r\n[Тестовая ссылка](/services)\r\n\r\n### Тест изображения\r\n![Test_image](/images/ievgi_195x195.png)\r\n\r\nПодробнее — на странице турнира.", null, true, "Кубок Весны 2025 — регистрация открыта!", 100, "Подробнее:/tournaments/custom/details/2", null });

            migrationBuilder.InsertData(
                table: "Tournaments",
                columns: new[] { "Id", "Classes", "CreatedAtUtc", "DateEnd", "DateStart", "Description", "EventId", "Format", "InitialParticipants", "IsPublished", "IsStream", "MaxParticipants", "Name", "OpenForAll", "PrizeText", "RegEnd", "RegStart", "ReserveSize", "Sponsor", "Status", "StreamUrl", "TeamSize", "Tier", "Type" },
                values: new object[] { 3, "ST", new DateTime(2025, 4, 18, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2025, 4, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 25, 0, 0, 0, 0, DateTimeKind.Unspecified), "Небольшой тренировочный турнир для клана EVG. Формат 3x3, любой уровень VI–VIII.", null, "3x3", 6, true, false, null, "Тренировочный 3x3", false, null, new DateTime(2025, 4, 24, 0, 0, 0, 0, DateTimeKind.Unspecified), new DateTime(2025, 4, 18, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, null, "upcoming", null, 3, 8, "common" });

            migrationBuilder.InsertData(
                table: "Vehicles",
                columns: new[] { "Id", "InternalName", "IsCollector", "IsPremium", "IsSpecial", "IsTechTree", "Name", "Nation", "Role", "ShortName", "Tier", "Type", "UpdatedAtUtc" },
                values: new object[] { 7169, "r45_is-7", false, false, false, true, "ИС-7", "ussr", "role_HT_break", "ИС-7", 10, "heavyTank", new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.InsertData(
                table: "DirectoryVehicles",
                columns: new[] { "VehicleId", "ImageUrl", "IsPublished", "UpdatedAtUtc" },
                values: new object[] { 7169, "/images/tanks/r45_is-7.webp", true, new DateTime(2026, 5, 15, 0, 0, 0, 0, DateTimeKind.Utc) });

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
                table: "DirectoryBuilds",
                columns: new[] { "Id", "Equipment1Key", "Equipment2Key", "Equipment3Key", "ModeKey", "SortOrder", "StateKey", "VehicleId" },
                values: new object[,]
                {
                    { 716901, "turbine__t3", "stabilizer__bonns", "rammer__t3", "random", 1, "default", 7169 },
                    { 716902, "hardening__t3", "stabilizer__bonns", "rammer__t3", "random", 2, "state1", 7169 },
                    { 716903, "hardening__t3", "rammer__t3", "turbine__t3", "fortified", 3, "default", 7169 }
                });

            migrationBuilder.InsertData(
                table: "DirectoryFieldModifications",
                columns: new[] { "Id", "LeftItemKey", "LeftSelected", "RightItemKey", "RightSelected", "SectionKey", "SortOrder", "VehicleId" },
                values: new object[,]
                {
                    { 716911, "item__1", false, "item__2", true, "section1", 1, 7169 },
                    { 716912, "item__3", true, "item__4", false, "section2", 2, 7169 },
                    { 716913, "item__5", false, "item__6", true, "section3", 3, 7169 },
                    { 716914, "item__7", true, "item__8", false, "section4", 4, 7169 },
                    { 716915, "item__9", false, "item__10", true, "section5", 5, 7169 }
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
                name: "UX_AspNetUsers_ClanId_Commander",
                table: "AspNetUsers",
                column: "ClanId",
                unique: true,
                filter: "\"ClanId\" IS NOT NULL AND \"ClanRank\" = 'Commander'");

            migrationBuilder.CreateIndex(
                name: "IX_ClanReserveActivations_ActivatedByUserId",
                table: "ClanReserveActivations",
                column: "ActivatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanReserveActivations_ClanId",
                table: "ClanReserveActivations",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_ClanReserveActivations_ClanId_ReserveGroup_EndsAtUtc",
                table: "ClanReserveActivations",
                columns: new[] { "ClanId", "ReserveGroup", "EndsAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ClanReserveInventories_ClanId",
                table: "ClanReserveInventories",
                column: "ClanId");

            migrationBuilder.CreateIndex(
                name: "IX_Clans_Tag",
                table: "Clans",
                column: "Tag",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectoryBuilds_VehicleId_ModeKey_StateKey",
                table: "DirectoryBuilds",
                columns: new[] { "VehicleId", "ModeKey", "StateKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DirectoryFieldModifications_VehicleId_SectionKey",
                table: "DirectoryFieldModifications",
                columns: new[] { "VehicleId", "SectionKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HomeBanners_Slot",
                table: "HomeBanners",
                column: "Slot");

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
                name: "IX_PopupNotifications_EndsAtUtc",
                table: "PopupNotifications",
                column: "EndsAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_PopupNotifications_IsPublished",
                table: "PopupNotifications",
                column: "IsPublished");

            migrationBuilder.CreateIndex(
                name: "IX_PopupNotifications_SortOrder",
                table: "PopupNotifications",
                column: "SortOrder");

            migrationBuilder.CreateIndex(
                name: "IX_PopupNotifications_StartsAtUtc",
                table: "PopupNotifications",
                column: "StartsAtUtc");

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
                name: "IX_TournamentMatches_AdvancingRegistrationId",
                table: "TournamentMatches",
                column: "AdvancingRegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatches_LoserToMatchId",
                table: "TournamentMatches",
                column: "LoserToMatchId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatches_TournamentId",
                table: "TournamentMatches",
                column: "TournamentId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatches_WinnerRegistrationId",
                table: "TournamentMatches",
                column: "WinnerRegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatches_WinnerToMatchId",
                table: "TournamentMatches",
                column: "WinnerToMatchId");

            migrationBuilder.CreateIndex(
                name: "UX_TournamentMatches_Position",
                table: "TournamentMatches",
                columns: new[] { "TournamentId", "Bracket", "RoundSize", "RoundNumber", "MatchNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatchSlots_MatchId",
                table: "TournamentMatchSlots",
                column: "MatchId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatchSlots_RegistrationId",
                table: "TournamentMatchSlots",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentMatchSlots_SourceMatchId",
                table: "TournamentMatchSlots",
                column: "SourceMatchId");

            migrationBuilder.CreateIndex(
                name: "UX_TournamentMatchSlots_Match_Slot",
                table: "TournamentMatchSlots",
                columns: new[] { "MatchId", "SlotNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TournamentPrizes_TournamentId",
                table: "TournamentPrizes",
                column: "TournamentId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistrationPlayers_RegistrationId",
                table: "TournamentRegistrationPlayers",
                column: "RegistrationId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistrationPlayers_TournamentId_NormalizedNickna~",
                table: "TournamentRegistrationPlayers",
                columns: new[] { "TournamentId", "NormalizedNickname" },
                unique: true,
                filter: "\"BlocksNickname\" = TRUE");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistrations_AppUserId",
                table: "TournamentRegistrations",
                column: "AppUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TournamentRegistrations_ReviewedByUserId",
                table: "TournamentRegistrations",
                column: "ReviewedByUserId");

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
                name: "ClanReserveActivations");

            migrationBuilder.DropTable(
                name: "ClanReserveInventories");

            migrationBuilder.DropTable(
                name: "DataSyncStates");

            migrationBuilder.DropTable(
                name: "DirectoryBuilds");

            migrationBuilder.DropTable(
                name: "DirectoryEquipmentItems");

            migrationBuilder.DropTable(
                name: "DirectoryFieldModificationItems");

            migrationBuilder.DropTable(
                name: "DirectoryFieldModifications");

            migrationBuilder.DropTable(
                name: "HomeBanners");

            migrationBuilder.DropTable(
                name: "PopupNotifications");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "TournamentMaps");

            migrationBuilder.DropTable(
                name: "TournamentMatchSlots");

            migrationBuilder.DropTable(
                name: "TournamentPrizes");

            migrationBuilder.DropTable(
                name: "TournamentRegistrationPlayers");

            migrationBuilder.DropTable(
                name: "VehicleMarks");

            migrationBuilder.DropTable(
                name: "VehicleMasteries");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "DirectoryVehicles");

            migrationBuilder.DropTable(
                name: "TournamentMatches");

            migrationBuilder.DropTable(
                name: "Vehicles");

            migrationBuilder.DropTable(
                name: "TournamentRegistrations");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Tournaments");

            migrationBuilder.DropTable(
                name: "Clans");

            migrationBuilder.DropTable(
                name: "InfoItems");
        }
    }
}
