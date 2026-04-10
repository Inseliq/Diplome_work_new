import { apiClient } from '../client';

/**
 * GET /api/marks?server=ruby
 * Бэкенд проксирует запрос на poliroid.me, кеширует раз в сутки.
 *
 * Структура ответа от poliroid (через прокси):
 * [
 *   {
 *     tank_id:    number,
 *     name:       string,       // "Т-62А"
 *     nation:     string,       // "ussr"
 *     type:       string,       // "mediumTank"
 *     tier:       number,       // 10
 *     moe_65:     number,
 *     moe_85:     number,
 *     moe_95:     number,
 *     moe_100:    number | null,
 *   },
 *   ...
 * ]
 */
export const getMarks = (server = 'ruby') =>
  apiClient.get(`/marks?server=${server}`);

/**
 * Пример ASP.NET Controller (для справки бэкенд-разработчику):
 *
 * [HttpGet("marks")]
 * public async Task<IActionResult> GetMarks([FromQuery] string server = "ruby")
 * {
 *   var cacheKey = $"marks_{server}";
 *   if (!_cache.TryGetValue(cacheKey, out string json))
 *   {
 *     var url = $"https://poliroid.me/gunmarks/api/wot/vehicles/?server={server}&count=10000&order_by=name";
 *     using var http = _httpClientFactory.CreateClient();
 *     json = await http.GetStringAsync(url);
 *     _cache.Set(cacheKey, json, TimeSpan.FromHours(24));
 *   }
 *   return Content(json, "application/json");
 * }
 */