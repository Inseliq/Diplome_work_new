using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminReserveSetAmountRequest
{
    [Range(0, 100000, ErrorMessage = "Количество резервов должно быть от 0 до 100000")]
    public int Amount { get; set; }
}