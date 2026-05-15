using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace CosmoManager.Tests;

public class InfoControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public InfoControllerTests(CustomWebApplicationFactory factory)
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

    [Fact]
    public async Task GetNews_ReturnsOkAndNewsList()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/news");

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.Equal(JsonValueKind.Array, root.ValueKind);
        Assert.True(root.GetArrayLength() >= 3, "В списке должно быть минимум 3 новости.");

        var firstNews = root[0];

        Assert.True(firstNews.TryGetProperty("id", out _));
        Assert.True(firstNews.TryGetProperty("title", out _));
        Assert.True(firstNews.TryGetProperty("date", out _));
        Assert.True(firstNews.TryGetProperty("dateISO", out _));
        Assert.True(firstNews.TryGetProperty("category", out _));
        Assert.True(firstNews.TryGetProperty("excerpt", out _));

        Assert.False(
            firstNews.TryGetProperty("content", out _),
            "В списке новостей не должно быть поля content."
        );
    }

    [Fact]
    public async Task GetNewsById_ReturnsOkAndNewsDetail()
    {
        var client = CreateClient();

        var listResponse = await client.GetAsync("/api/news");
        var listBody = await AssertStatusAsync(listResponse, HttpStatusCode.OK);

        using var listJson = JsonDocument.Parse(listBody);
        var firstNewsId = listJson.RootElement[0].GetProperty("id").GetInt32();

        var response = await client.GetAsync($"/api/news/{firstNewsId}");

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.Equal(firstNewsId, root.GetProperty("id").GetInt32());
        Assert.True(root.TryGetProperty("title", out _));
        Assert.True(root.TryGetProperty("date", out _));
        Assert.True(root.TryGetProperty("dateISO", out _));
        Assert.True(root.TryGetProperty("category", out _));
        Assert.True(root.TryGetProperty("excerpt", out _));
        Assert.True(root.TryGetProperty("content", out _));
    }

    [Fact]
    public async Task GetNewsById_WhenNewsDoesNotExist_ReturnsNotFound()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/news/999999");

        var body = await AssertStatusAsync(response, HttpStatusCode.NotFound);

        Assert.Contains("Новость не найдена", body);
    }

    [Fact]
    public async Task GetEvents_ReturnsOkAndEventsList()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/events");

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.Equal(JsonValueKind.Array, root.ValueKind);
        Assert.True(root.GetArrayLength() >= 3, "В списке должно быть минимум 3 события.");

        var firstEvent = root[0];

        Assert.True(firstEvent.TryGetProperty("id", out _));
        Assert.True(firstEvent.TryGetProperty("title", out _));
        Assert.True(firstEvent.TryGetProperty("category", out _));
        Assert.True(firstEvent.TryGetProperty("status", out _));
        Assert.True(firstEvent.TryGetProperty("dateStart", out _));
        Assert.True(firstEvent.TryGetProperty("dateEnd", out _));
        Assert.True(firstEvent.TryGetProperty("dateStartISO", out _));
        Assert.True(firstEvent.TryGetProperty("dateEndISO", out _));
        Assert.True(firstEvent.TryGetProperty("excerpt", out _));

        Assert.False(
            firstEvent.TryGetProperty("content", out _),
            "В списке событий не должно быть поля content."
        );
    }

    [Fact]
    public async Task GetEventById_ReturnsOkAndEventDetail()
    {
        var client = CreateClient();

        var listResponse = await client.GetAsync("/api/events");
        var listBody = await AssertStatusAsync(listResponse, HttpStatusCode.OK);

        using var listJson = JsonDocument.Parse(listBody);
        var firstEventId = listJson.RootElement[0].GetProperty("id").GetInt32();

        var response = await client.GetAsync($"/api/events/{firstEventId}");

        var body = await AssertStatusAsync(response, HttpStatusCode.OK);

        using var json = JsonDocument.Parse(body);
        var root = json.RootElement;

        Assert.Equal(firstEventId, root.GetProperty("id").GetInt32());
        Assert.True(root.TryGetProperty("title", out _));
        Assert.True(root.TryGetProperty("category", out _));
        Assert.True(root.TryGetProperty("status", out _));
        Assert.True(root.TryGetProperty("dateStart", out _));
        Assert.True(root.TryGetProperty("dateEnd", out _));
        Assert.True(root.TryGetProperty("content", out _));
    }

    [Fact]
    public async Task GetEventById_WhenEventDoesNotExist_ReturnsNotFound()
    {
        var client = CreateClient();

        var response = await client.GetAsync("/api/events/999999");

        var body = await AssertStatusAsync(response, HttpStatusCode.NotFound);

        Assert.Contains("Событие не найдено", body);
    }
}