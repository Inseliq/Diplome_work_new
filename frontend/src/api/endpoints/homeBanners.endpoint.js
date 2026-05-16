import { apiClient } from '../client';

/**
 * GET /api/home-banners
 * Возвращает рекламные баннеры главной страницы.
 */
export const getHomeBanners = () => apiClient.get('/api/home-banners');