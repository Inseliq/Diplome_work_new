using System.ComponentModel.DataAnnotations;

namespace CosmoManager.Requests.Admin;

public class AdminReserveAdjustAmountRequest
{
    [Range(-100000, 100000, ErrorMessage = "Изменение должно быть от -100000 до 100000")]
    public int Delta { get; set; }
}