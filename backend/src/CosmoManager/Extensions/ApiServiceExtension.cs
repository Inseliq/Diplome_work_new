using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Text;

namespace CosmoManager.Extensions;

public static class ApiServiceExtension
{
    public static IServiceCollection AddCorsPolicy(this IServiceCollection services, IConfiguration config)
    {
        var configuredOrigins = config
            .GetSection("Cors:AllowedOrigins")
            .Get<string[]>()
            ?? [];

        var rawOrigins = new List<string>(configuredOrigins);

        var fallbackOriginsRaw = config["Cors:AllowedOrigins"];
        if (!string.IsNullOrWhiteSpace(fallbackOriginsRaw))
        {
            rawOrigins.Add(fallbackOriginsRaw);
        }

        var allowedOrigins = rawOrigins
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .SelectMany(origin => origin.Split([',', ';', ' '], StringSplitOptions.RemoveEmptyEntries))
            .Select(origin => origin.Trim().TrimEnd('/'))
            .Where(origin =>
                Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (allowedOrigins.Length == 0)
        {
            allowedOrigins =
            [
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:5132"
            ];
        }

        services.AddCors(options =>
        {
            options.AddPolicy("AllowReact", policy =>
            {
                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials();
            });
        });

        return services;
    }

    public static IServiceCollection AddSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();

        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "CosmoManager API",
                Version = "v1"
            });

            c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Введите JWT-токен без слова Bearer"
            });

            c.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer", document)] = []
            });
        });

        return services;
    }

    public static IServiceCollection AddJwt(
        this IServiceCollection services,
        IConfiguration config)
    {
        var jwtKey = config["Jwt:Key"];

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException("Jwt:Key is not configured.");
        }

        var key = Encoding.UTF8.GetBytes(jwtKey);

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(JwtBearerDefaults.AuthenticationScheme, options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer = config["Jwt:Issuer"],
                ValidAudience = config["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key),

                NameClaimType = "sub",
                RoleClaimType = "role",

                ClockSkew = TimeSpan.Zero
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.TryGetValue("accessToken", out var token))
                    {
                        context.Token = token;
                    }

                    return Task.CompletedTask;
                }
            };
        });

        services.AddAuthorization();

        return services;
    }
}