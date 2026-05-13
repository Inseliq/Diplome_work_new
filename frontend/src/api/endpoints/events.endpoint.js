import { apiClient } from '../client';

/**
 * GET /api/events
 * Возвращает список событий БЕЗ поля content.
 */
export const getEvents = () => apiClient.get('/api/events');

/**
 * GET /api/events/:id
 * Возвращает одно событие С полем content.
 */
export const getEventById = (id) => apiClient.get(`/api/events/${id}`);