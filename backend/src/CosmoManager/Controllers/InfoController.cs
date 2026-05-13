using System.Globalization;
using CosmoManager.Data;
using CosmoManager.Models;
using CosmoManager.Responses.Info;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmoManager.Controllers;

[ApiController]
[Route("api")]
public class InfoController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public InfoController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("news")]
    public async Task<ActionResult<IEnumerable<NewsListItemResponse>>> GetNews(
        CancellationToken cancellationToken)
    {
        var news = await _dbContext.InfoItems
            .AsNoTracking()
            .Where(x => x.Type == InfoItemType.News && x.IsPublished)
            .OrderByDescending(x => x.DateStart)
            .Select(x => new NewsListItemResponse
            {
                Id = x.Id,
                Title = x.Title,
                Date = FormatDate(x.DateStart),
                DateISO = ToIsoDate(x.DateStart),
                Category = x.Category,
                Image = x.ImageUrl,
                Gradient = x.Gradient,
                Excerpt = x.Excerpt
            })
            .ToListAsync(cancellationToken);

        return Ok(news);
    }

    [HttpGet("news/{id:int}")]
    public async Task<ActionResult<NewsDetailResponse>> GetNewsById(
        int id,
        CancellationToken cancellationToken)
    {
        var news = await _dbContext.InfoItems
            .AsNoTracking()
            .Where(x => x.Type == InfoItemType.News && x.IsPublished && x.Id == id)
            .Select(x => new NewsDetailResponse
            {
                Id = x.Id,
                Title = x.Title,
                Date = FormatDate(x.DateStart),
                DateISO = ToIsoDate(x.DateStart),
                Category = x.Category,
                Image = x.ImageUrl,
                Gradient = x.Gradient,
                Excerpt = x.Excerpt,
                Content = x.Content
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (news == null)
        {
            return NotFound(new
            {
                message = "Новость не найдена"
            });
        }

        return Ok(news);
    }

    [HttpGet("events")]
    public async Task<ActionResult<IEnumerable<EventListItemResponse>>> GetEvents(
        CancellationToken cancellationToken)
    {
        var events = await _dbContext.InfoItems
            .AsNoTracking()
            .Where(x => x.Type == InfoItemType.Event && x.IsPublished)
            .OrderByDescending(x => x.DateStart)
            .Select(x => new EventListItemResponse
            {
                Id = x.Id,
                Title = x.Title,
                Category = x.Category,
                Status = x.Status ?? "soon",
                DateStart = FormatDate(x.DateStart),
                DateEnd = FormatDate(x.DateEnd ?? x.DateStart),
                DateStartISO = ToIsoDate(x.DateStart),
                DateEndISO = ToIsoDate(x.DateEnd ?? x.DateStart),
                Image = x.ImageUrl,
                Gradient = x.Gradient,
                Excerpt = x.Excerpt
            })
            .ToListAsync(cancellationToken);

        return Ok(events);
    }

    [HttpGet("events/{id:int}")]
    public async Task<ActionResult<EventDetailResponse>> GetEventById(
        int id,
        CancellationToken cancellationToken)
    {
        var item = await _dbContext.InfoItems
            .AsNoTracking()
            .Where(x => x.Type == InfoItemType.Event && x.IsPublished && x.Id == id)
            .Select(x => new EventDetailResponse
            {
                Id = x.Id,
                Title = x.Title,
                Category = x.Category,
                Status = x.Status ?? "soon",
                DateStart = FormatDate(x.DateStart),
                DateEnd = FormatDate(x.DateEnd ?? x.DateStart),
                DateStartISO = ToIsoDate(x.DateStart),
                DateEndISO = ToIsoDate(x.DateEnd ?? x.DateStart),
                Image = x.ImageUrl,
                Gradient = x.Gradient,
                Excerpt = x.Excerpt,
                Content = x.Content
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (item == null)
        {
            return NotFound(new
            {
                message = "Событие не найдено"
            });
        }

        return Ok(item);
    }

    private static string FormatDate(DateTime date)
    {
        return date.ToString("d MMMM yyyy", CultureInfo.GetCultureInfo("ru-RU"));
    }

    private static string ToIsoDate(DateTime date)
    {
        return date.ToString("yyyy-MM-dd");
    }
}