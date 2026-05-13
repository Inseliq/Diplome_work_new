using Microsoft.AspNetCore.Identity;

namespace CosmoManager.Models;

public class AppUser : IdentityUser
{
  public string Nickname { get; set; } = string.Empty;
}