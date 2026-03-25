import { config } from './config/env';
import { logger } from '../app/utils/logger';

/**
 * Базовый HTTP-клиент.
 * Все запросы идут на VITE_API_URL.
 * При ошибке бросает { status, message }.
 */
async function request(path, options = {}) {
  const url = `${config.apiUrl}${path}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    logger.api(options.method || 'GET', url, res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw { status: res.status, message: text || res.statusText };
    }

    // 204 No Content
    if (res.status === 204) return null;

    return await res.json();
  } catch (err) {
    // Сетевая ошибка (нет соединения, CORS и т.д.)
    if (!err.status) {
      logger.warn(`Network error: ${url}`, err);
      throw { status: 0, message: 'Network error' };
    }
    logger.error(`API error ${err.status}: ${url}`, err);
    throw err;
  }
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};