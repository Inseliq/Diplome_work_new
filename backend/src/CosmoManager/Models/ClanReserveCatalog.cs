namespace CosmoManager.Models;

public sealed record ClanReserveDefinition(
    ClanReserveType Type,
    string TypeKey,
    ClanReserveGroup Group,
    string GroupKey,
    string GroupTitle,
    string Title,
    string Description,
    string BonusText,
    string ImageUrl
);

public static class ClanReserveCatalog
{
    public static readonly IReadOnlyList<ClanReserveDefinition> All =
    [
        new ClanReserveDefinition(
            Type: ClanReserveType.SilverCredits,
            TypeKey: "silverCredits",
            Group: ClanReserveGroup.Finance,
            GroupKey: "finance",
            GroupTitle: "Финансовые резервы",
            Title: "Боевые выплаты",
            Description: "Увеличивает заработок серебра всеми участниками клана.",
            BonusText: "+100% к заработку серебра",
            ImageUrl: "/images/reserves/silverCredits.webp"
        ),

        new ClanReserveDefinition(
            Type: ClanReserveType.VehicleXp,
            TypeKey: "vehicleXp",
            Group: ClanReserveGroup.Finance,
            GroupKey: "finance",
            GroupTitle: "Финансовые резервы",
            Title: "Тактическая подготовка",
            Description: "Увеличивает заработок опыта на технику.",
            BonusText: "+100% к заработку опыта на технику",
            ImageUrl: "/images/reserves/vehicleXp.webp"
        ),

        new ClanReserveDefinition(
            Type: ClanReserveType.FreeXp,
            TypeKey: "freeXp",
            Group: ClanReserveGroup.Experience,
            GroupKey: "experience",
            GroupTitle: "Резервы опыта",
            Title: "Военные учения",
            Description: "Увеличивает заработок свободного опыта.",
            BonusText: "+50% к заработку свободного опыта",
            ImageUrl: "/images/reserves/freeXp.webp"
        ),

        new ClanReserveDefinition(
            Type: ClanReserveType.CrewXp,
            TypeKey: "crewXp",
            Group: ClanReserveGroup.Experience,
            GroupKey: "experience",
            GroupTitle: "Резервы опыта",
            Title: "Дополнительный инструктаж",
            Description: "Увеличивает получаемый опыт экипажа.",
            BonusText: "+200% к опыту экипажа",
            ImageUrl: "/images/reserves/crewXp.webp"
        )
    ];

    public static ClanReserveDefinition? GetByKey(string key)
    {
        return All.FirstOrDefault(x =>
            x.TypeKey.Equals(key, StringComparison.OrdinalIgnoreCase));
    }

    public static ClanReserveDefinition? GetByType(ClanReserveType type)
    {
        return All.FirstOrDefault(x => x.Type == type);
    }
}