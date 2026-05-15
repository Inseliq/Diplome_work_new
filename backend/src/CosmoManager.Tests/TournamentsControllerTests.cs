using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;

namespace CosmoManager.Tests;

public class TournamentsControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private const string TestJwtKey = "super-test-secret-key-for-integration-tests-123456789";
    private const string TestJwtIssuer = "CosmoManager.Tests";
    private const string TestJwtAudience = "CosmoManager.Tests";

    private readonly CustomWebApplicationFactory _factory;

    public TournamentsControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient()
    {
        return _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = true
        });
    }

    private static async Task<string> AssertStatusAsync(
        HttpResponseMessage response,
        HttpStatusCode expectedStatusCode)
    {
        var body = await response.Content.ReadAsStringAsync();

        Assert.True(
            response.StatusCode == expectedStatusCode,
            $"Ожидался статус: {expectedStatusCode}\n" +
            $"Получен статус: {response.StatusCode}\n" +
            $"Тело ответа:\n{body}"
        );

        return body;
    }

    private static async Task AuthorizeClientAsync(
    HttpClient client,
    string nickname,
    string email)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            nickname,
            email,
            password = "Qwerty123!",
            confirmPassword = "Qwerty123!"
        });

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);

        var userId = json.RootElement
            .GetProperty("user")
            .GetProperty("id")
            .GetString();

        Assert.False(
            string.IsNullOrWhiteSpace(userId),
            $"В ответе регистрации не найден user.id. Тело ответа:\n{body}"
        );

        client.DefaultRequestHeaders.Remove("X-Test-UserId");
        client.DefaultRequestHeaders.Add("X-Test-UserId", userId);
    }

    private static string CreateTestJwt(
        string userId,
        string email,
        string nickname)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtKey));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(ClaimTypes.NameIdentifier, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, nickname),
            new("nickname", nickname)
        };

        var token = new JwtSecurityToken(
            issuer: TestJwtIssuer,
            audience: TestJwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(30),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private async Task<int> GetFirstTournamentIdAsync(HttpClient client)
    {
        var response = await client.GetAsync("/api/tournaments/custom");
        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.True(
            root.GetArrayLength() > 0,
            "В базе должен быть хотя бы один турнир."
        );

        return root[0].GetProperty("id").GetInt32();
    }

    private async Task<int> GetRegistrationTournamentIdAsync(HttpClient client)
    {
        var response = await client.GetAsync("/api/tournaments/custom");
        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);

        foreach (var item in json.RootElement.EnumerateArray())
        {
            var status = item.GetProperty("status").GetString();
            var openForAll = item.GetProperty("openForAll").GetBoolean();

            if (status == "registration" && openForAll)
            {
                return item.GetProperty("id").GetInt32();
            }
        }

        throw new InvalidOperationException(
            "В тестовых данных нет турнира со статусом registration и openForAll = true."
        );
    }

    private async Task<int> GetClosedTournamentIdAsync(HttpClient client)
    {
        var response = await client.GetAsync("/api/tournaments/custom");
        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);

        foreach (var item in json.RootElement.EnumerateArray())
        {
            var status = item.GetProperty("status").GetString();

            if (status != "registration")
            {
                return item.GetProperty("id").GetInt32();
            }
        }

        throw new InvalidOperationException(
            "В тестовых данных нет турнира с закрытой регистрацией."
        );
    }

    [Fact]
    public async Task GetCustomTournaments_ReturnsOkAndTournamentList()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/tournaments/custom");

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.Equal(JsonValueKind.Array, root.ValueKind);

        Assert.True(
            root.GetArrayLength() >= 3,
            "В списке должно быть минимум 3 турнира."
        );

        var firstTournament = root[0];

        Assert.True(firstTournament.TryGetProperty("id", out _));
        Assert.True(firstTournament.TryGetProperty("name", out _));
        Assert.True(firstTournament.TryGetProperty("description", out _));
        Assert.True(firstTournament.TryGetProperty("type", out _));
        Assert.True(firstTournament.TryGetProperty("tier", out _));
        Assert.True(firstTournament.TryGetProperty("format", out _));
        Assert.True(firstTournament.TryGetProperty("teamSize", out _));
        Assert.True(firstTournament.TryGetProperty("reserveSize", out _));
        Assert.True(firstTournament.TryGetProperty("status", out _));
        Assert.True(firstTournament.TryGetProperty("currentParticipants", out _));
        Assert.True(firstTournament.TryGetProperty("openForAll", out _));
        Assert.True(firstTournament.TryGetProperty("maps", out _));
        Assert.True(firstTournament.TryGetProperty("prizes", out _));
    }

    [Fact]
    public async Task GetCustomTournamentById_ReturnsOkAndTournamentDetail()
    {
        var client = CreateClient();

        var tournamentId = await GetFirstTournamentIdAsync(client);

        var response = await client.GetAsync($"/api/tournaments/custom/{tournamentId}");

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.Equal(tournamentId, root.GetProperty("id").GetInt32());

        Assert.True(root.TryGetProperty("name", out _));
        Assert.True(root.TryGetProperty("description", out _));
        Assert.True(root.TryGetProperty("type", out _));
        Assert.True(root.TryGetProperty("tier", out _));
        Assert.True(root.TryGetProperty("format", out _));
        Assert.True(root.TryGetProperty("status", out _));
        Assert.True(root.TryGetProperty("maps", out _));
        Assert.True(root.TryGetProperty("prizes", out _));
        Assert.True(root.TryGetProperty("eventId", out _));
    }

    [Fact]
    public async Task GetCustomTournamentById_WhenTournamentDoesNotExist_ReturnsNotFound()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/tournaments/custom/999999");

        var body = await AssertStatusAsync(response, HttpStatusCode.NotFound);

        Assert.Contains("Турнир не найден", body);
    }

    [Fact]
    public async Task RegisterToTournament_WithoutAuth_ReturnsUnauthorized()
    {
        var client = CreateClient();

        var tournamentId = await GetRegistrationTournamentIdAsync(client);

        var response = await client.PostAsJsonAsync(
            $"/api/tournaments/custom/{tournamentId}/register",
            new
            {
                teamName = "No Auth Team",
                contact = "@no_auth",
                comment = "Попытка регистрации без аккаунта"
            });

        await AssertStatusAsync(response, HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task RegisterToTournament_WithAuth_ReturnsOk()
    {
        var client = CreateClient();

        await AuthorizeClientAsync(
            client,
            nickname: "TournamentUserOne",
            email: "tournament-user-one@test.ru");

        var tournamentId = await GetRegistrationTournamentIdAsync(client);

        var response = await client.PostAsJsonAsync(
            $"/api/tournaments/custom/{tournamentId}/register",
            new
            {
                teamName = "Test Team One",
                contact = "@test_team_one",
                comment = "Тестовая заявка на турнир"
            });

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        Assert.Contains("Вы успешно зарегистрированы на турнир", body);
    }

    [Fact]
    public async Task RegisterToTournament_WhenAlreadyRegistered_ReturnsBadRequest()
    {
        var client = CreateClient();

        await AuthorizeClientAsync(
            client,
            nickname: "TournamentUserTwo",
            email: "tournament-user-two@test.ru");

        var tournamentId = await GetRegistrationTournamentIdAsync(client);

        var firstResponse = await client.PostAsJsonAsync(
            $"/api/tournaments/custom/{tournamentId}/register",
            new
            {
                teamName = "Test Team Two",
                contact = "@test_team_two",
                comment = "Первая заявка"
            });

        await AssertStatusAsync(firstResponse, HttpStatusCode.OK);

        var secondResponse = await client.PostAsJsonAsync(
            $"/api/tournaments/custom/{tournamentId}/register",
            new
            {
                teamName = "Test Team Two",
                contact = "@test_team_two",
                comment = "Повторная заявка"
            });

        var body = await AssertStatusAsync(secondResponse, HttpStatusCode.BadRequest);

        Assert.Contains("Вы уже зарегистрированы на этот турнир", body);
    }

    [Fact]
    public async Task RegisterToTournament_WhenRegistrationClosed_ReturnsBadRequest()
    {
        var client = CreateClient();

        await AuthorizeClientAsync(
            client,
            nickname: "TournamentUserThree",
            email: "tournament-user-three@test.ru");

        var closedTournamentId = await GetClosedTournamentIdAsync(client);

        var response = await client.PostAsJsonAsync(
            $"/api/tournaments/custom/{closedTournamentId}/register",
            new
            {
                teamName = "Closed Tournament Team",
                contact = "@closed_team",
                comment = "Попытка регистрации на закрытый турнир"
            });

        var body = await AssertStatusAsync(response, HttpStatusCode.BadRequest);

        Assert.Contains("Регистрация на этот турнир сейчас закрыта", body);
    }
}