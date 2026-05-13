using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace CosmoManager.Tests;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public AuthControllerTests(CustomWebApplicationFactory factory)
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

    private static string? GetJsonStringProperty(string json, string propertyName)
    {
        using var document = JsonDocument.Parse(json);

        if (!document.RootElement.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.GetString();
    }

    [Fact]
    public async Task Register_WithValidData_ReturnsOk()
    {
        var client = CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            nickname = "RegisterUser",
            email = "register-user@test.ru",
            password = "Qwerty123!",
            confirmPassword = "Qwerty123!"
        });

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        var message = GetJsonStringProperty(body, "message");
        var accessToken = GetJsonStringProperty(body, "accessToken");

        Assert.Equal("Регистрация прошла успешно", message);
        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        Assert.Contains("RegisterUser", body);
        Assert.Contains("register-user@test.ru", body);
    }

    [Fact]
    public async Task Login_WithCorrectData_ReturnsOk()
    {
        var client = CreateClient();

        await client.PostAsJsonAsync("/api/auth/register", new
        {
            nickname = "LoginUser",
            email = "login-user@test.ru",
            password = "Qwerty123!",
            confirmPassword = "Qwerty123!"
        });

        var response = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "login-user@test.ru",
            password = "Qwerty123!"
        });

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        var message = GetJsonStringProperty(body, "message");
        var accessToken = GetJsonStringProperty(body, "accessToken");

        Assert.Equal("Вход выполнен успешно", message);
        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        Assert.Contains("LoginUser", body);
        Assert.Contains("login-user@test.ru", body);
    }

    [Fact]
    public async Task Logout_ReturnsOk()
    {
        var client = CreateClient();

        await client.PostAsJsonAsync("/api/auth/register", new
        {
            nickname = "LogoutUser",
            email = "logout-user@test.ru",
            password = "Qwerty123!",
            confirmPassword = "Qwerty123!"
        });

        var response = await client.PostAsync("/api/auth/logout", null);

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        var message = GetJsonStringProperty(body, "message");

        Assert.Equal("Выход выполнен успешно", message);
    }
}