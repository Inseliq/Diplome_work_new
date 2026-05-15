using CosmoManager.Models;
using Microsoft.AspNetCore.Identity;

namespace CosmoManager.Extensions;

public static class RoleSeederExtension
{
    public static async Task SeedRolesAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();

        var roleManager = scope.ServiceProvider
            .GetRequiredService<RoleManager<IdentityRole>>();

        var userManager = scope.ServiceProvider
            .GetRequiredService<UserManager<AppUser>>();

        foreach (var roleName in AppRoles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(roleName));

                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(x => x.Description));
                    throw new InvalidOperationException($"Не удалось создать роль {roleName}: {errors}");
                }
            }
        }

        var adminEmail = app.Configuration["Seed:AdminEmail"];

        if (!string.IsNullOrWhiteSpace(adminEmail))
        {
            var admin = await userManager.FindByEmailAsync(adminEmail);

            if (admin != null && !await userManager.IsInRoleAsync(admin, AppRoles.Administrator))
            {
                await userManager.AddToRoleAsync(admin, AppRoles.Administrator);
            }
        }
    }
}