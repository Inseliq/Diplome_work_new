using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;

    public AuthController(
        UserManager<AppUser> userManager,
        AppDbContext dbContext,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _dbContext = dbContext;
        _configuration = configuration;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(
        [FromBody] RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.Password != request.ConfirmPassword)
        {
            return BadRequest(new
            {
                message = "Пароли не совпадают"
            });
        }

        var email = request.Email.Trim();

        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser != null)
        {
            return BadRequest(new
            {
                message = "Пользователь с такой почтой уже существует"
            });
        }

        var user = new AppUser
        {
            UserName = email,
            Email = email
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                message = "Ошибка регистрации",
                errors = result.Errors.Select(error => error.Description).ToArray()
            });
        }

        var accessToken = await GenerateAccessTokenAsync(user);
        var refreshToken = GenerateRefreshToken();

        await SaveRefreshTokenAsync(user, refreshToken, cancellationToken);

        SetAuthCookies(accessToken, refreshToken);

        return Ok(new
        {
            message = "Регистрация прошла успешно",
            accessToken,
            user = new
            {
                id = user.Id,
                email = user.Email
            }
        });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var email = request.Email.Trim();

        var user = await _userManager.FindByEmailAsync(email);

        if (user == null)
        {
            return Unauthorized(new
            {
                message = "Неверная почта или пароль"
            });
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!isPasswordValid)
        {
            return Unauthorized(new
            {
                message = "Неверная почта или пароль"
            });
        }

        var accessToken = await GenerateAccessTokenAsync(user);
        var refreshToken = GenerateRefreshToken();

        await SaveRefreshTokenAsync(user, refreshToken, cancellationToken);

        SetAuthCookies(accessToken, refreshToken);

        return Ok(new
        {
            message = "Вход выполнен успешно",
            accessToken,
            user = new
            {
                id = user.Id,
                email = user.Email
            }
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
        {
            return Unauthorized(new
            {
                message = "Refresh token отсутствует"
            });
        }

        var refreshTokenHash = HashToken(refreshToken);

        var storedRefreshToken = await _dbContext.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.TokenHash == refreshTokenHash, cancellationToken);

        if (storedRefreshToken == null)
        {
            DeleteAuthCookies();

            return Unauthorized(new
            {
                message = "Refresh token не найден"
            });
        }

        if (!storedRefreshToken.IsActive)
        {
            DeleteAuthCookies();

            return Unauthorized(new
            {
                message = "Refresh token истёк или был отозван"
            });
        }

        var user = storedRefreshToken.User;

        var newAccessToken = await GenerateAccessTokenAsync(user);
        var newRefreshToken = GenerateRefreshToken();
        var newRefreshTokenHash = HashToken(newRefreshToken);

        storedRefreshToken.RevokedAtUtc = DateTime.UtcNow;
        storedRefreshToken.RevokedByIp = GetClientIp();
        storedRefreshToken.ReplacedByTokenHash = newRefreshTokenHash;

        var newStoredRefreshToken = new RefreshToken
        {
            TokenHash = newRefreshTokenHash,
            AppUserId = user.Id,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(GetRefreshTokenDays()),
            CreatedByIp = GetClientIp(),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        _dbContext.RefreshTokens.Add(newStoredRefreshToken);

        await _dbContext.SaveChangesAsync(cancellationToken);

        SetAuthCookies(newAccessToken, newRefreshToken);

        return Ok(new
        {
            message = "Токены обновлены",
            accessToken = newAccessToken,
            user = new
            {
                id = user.Id,
                email = user.Email
            }
        });
    }

    [HttpPost("logout")]
    [AllowAnonymous]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue("refreshToken", out var refreshToken))
        {
            var refreshTokenHash = HashToken(refreshToken);

            var storedRefreshToken = await _dbContext.RefreshTokens
                .FirstOrDefaultAsync(x => x.TokenHash == refreshTokenHash, cancellationToken);

            if (storedRefreshToken != null && storedRefreshToken.IsActive)
            {
                storedRefreshToken.RevokedAtUtc = DateTime.UtcNow;
                storedRefreshToken.RevokedByIp = GetClientIp();

                await _dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        DeleteAuthCookies();

        return Ok(new
        {
            message = "Выход выполнен успешно"
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            id = user.Id,
            email = user.Email
        });
    }

    private async Task<string> GenerateAccessTokenAsync(AppUser user)
    {
        var jwtKey = _configuration["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException("Jwt:Key is not configured.");
        }

        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(ClaimTypes.NameIdentifier, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        var roles = await _userManager.GetRolesAsync(user);

        foreach (var role in roles)
        {
            claims.Add(new Claim("role", role));
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(GetAccessTokenMinutes()),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task SaveRefreshTokenAsync(
        AppUser user,
        string refreshToken,
        CancellationToken cancellationToken)
    {
        var refreshTokenHash = HashToken(refreshToken);

        var storedRefreshToken = new RefreshToken
        {
            TokenHash = refreshTokenHash,
            AppUserId = user.Id,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(GetRefreshTokenDays()),
            CreatedByIp = GetClientIp(),
            UserAgent = Request.Headers.UserAgent.ToString()
        };

        _dbContext.RefreshTokens.Add(storedRefreshToken);

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string GenerateRefreshToken()
    {
        var randomBytes = RandomNumberGenerator.GetBytes(64);

        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", string.Empty);
    }

    private static string HashToken(string token)
    {
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = SHA256.HashData(bytes);

        return Convert.ToBase64String(hash);
    }

    private void SetAuthCookies(string accessToken, string refreshToken)
    {
        Response.Cookies.Append("accessToken", accessToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddMinutes(GetAccessTokenMinutes())
        });

        Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTimeOffset.UtcNow.AddDays(GetRefreshTokenDays())
        });
    }

    private void DeleteAuthCookies()
    {
        Response.Cookies.Delete("accessToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });

        Response.Cookies.Delete("refreshToken", new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None
        });
    }

    private int GetAccessTokenMinutes()
    {
        return _configuration.GetValue<int?>("Jwt:AccessTokenMinutes") ?? 15;
    }

    private int GetRefreshTokenDays()
    {
        return _configuration.GetValue<int?>("Jwt:RefreshTokenDays") ?? 7;
    }

    private string? GetClientIp()
    {
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }
}
