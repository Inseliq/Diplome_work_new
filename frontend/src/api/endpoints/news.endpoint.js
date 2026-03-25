import { apiClient } from '../client';

/**
 * GET /api/news
 * Возвращает список новостей БЕЗ поля content.
 */
export const getNews = () => apiClient.get('/news');

/**
 * GET /api/news/:id
 * Возвращает одну новость С полем content.
 */
export const getNewsById = (id) => apiClient.get(`/news/${id}`);