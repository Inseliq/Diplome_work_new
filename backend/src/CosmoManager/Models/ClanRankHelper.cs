namespace CosmoManager.Models;

public static class ClanRankHelper
{
    public static bool GivesModeratorRole(ClanRank? rank)
    {
        return rank >= ClanRank.UnitCommander;
    }

    public static string GetLabel(ClanRank rank)
    {
        return rank switch
        {
            ClanRank.Reservist => "Резервист",
            ClanRank.Recruit => "Новобранец",
            ClanRank.Fighter => "Боец",
            ClanRank.JuniorOfficer => "Младший офицер",
            ClanRank.UnitCommander => "Командир подразделения",
            ClanRank.StaffOfficer => "Офицер штаба",
            ClanRank.DeputyCommander => "Заместитель командующего",
            ClanRank.Commander => "Командующий",
            _ => rank.ToString()
        };
    }
}