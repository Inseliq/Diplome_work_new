using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using CosmoManager.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace CosmoManager.Controllers.Admin;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;

    public AdminController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard()
    {
        var user = await GetCurrentUserAsync();

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Необходимо войти в аккаунт"
            });
        }

        if (!await _userManager.IsInRoleAsync(user, AppRoles.Administrator))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                message = "Доступ разрешён только администратору"
            });
        }

        return Ok(new
        {
            title = "Административная панель",
            description = "Главная страница управления системой CosmoManager.",
            sections = new[]
            {
                new
                {
                    key = "users",
                    title = "Пользователи",
                    description = "Управление аккаунтами, ролями и доступом пользователей.",
                    path = "/admin/users"
                },
                new
                {
                    key = "clans",
                    title = "Кланы",
                    description = "Создание кланов, назначение игроков и управление званиями.",
                    path = "/admin/clans"
                },
                new
                {
                    key = "clan-reserves",
                    title = "Резервы кланов",
                    description = "Пополнение склада резервов и контроль активных клановых бонусов.",
                    path = "/admin/reserves"
                },
                new
                {
                    key = "tournaments",
                    title = "Турниры",
                    description = "Создание и редактирование пользовательских турниров.",
                    path = "/admin/tournaments"
                },
                new
                {
                    key = "tournament-matches",
                    title = "Матчи турниров",
                    description = "Формирование матчей, сеток, результатов и победителей.",
                    path = "/admin/tournament-matches"
                },
                new
                {
                    key = "news",
                    title = "Новости",
                    description = "Публикация новостей, обновлений и информационных материалов.",
                    path = "/admin/news"
                },
                new
                {
                    key = "home-banners",
                    title = "Баннеры главной",
                    description = "Управление двумя рекламными баннерами на главной странице.",
                    path = "/admin/home-banners"
                },
                new
                {
                    key = "events",
                    title = "События",
                    description = "Создание игровых событий и привязка турниров к событиям.",
                    path = "/admin/events"
                },
                new
                {
                    key = "notifications",
                    title = "Уведомления",
                    description = "Настройка всплывающих уведомлений для пользователей.",
                    path = "/admin/notifications"
                },
                new
                {
                    key = "vehicle-builds",
                    title = "Сборки техники",
                    description = "Управление оборудованием и полевой модернизацией танков.",
                    path = "/admin/directory"
                }
            }
        });
    }

    private async Task<AppUser?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return null;
        }

        return await _userManager.FindByIdAsync(userId);
    }
}